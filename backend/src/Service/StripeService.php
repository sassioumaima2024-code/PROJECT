<?php

namespace App\Service;

use App\Entity\Appointment;
use App\Entity\Payment;
use App\Entity\User;
use App\Repository\PaymentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;

class StripeService
{
    private string $stripeSecretKey;
    private string $stripePublishableKey;
    private PaymentRepository $paymentRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        string $stripeSecretKey,
        string $stripePublishableKey,
        PaymentRepository $paymentRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->stripeSecretKey = $stripeSecretKey;
        $this->stripePublishableKey = $stripePublishableKey;
        $this->paymentRepository = $paymentRepository;
        $this->entityManager = $entityManager;
        
        Stripe::setApiKey($this->stripeSecretKey);
        Stripe::setApiVersion('2023-10-16');
    }

    public function getPublishableKey(): string
    {
        return $this->stripePublishableKey;
    }

    public function createCustomer(User $user): Customer
    {
        try {
            $customer = Customer::create([
                'email' => $user->getEmail(),
                'name' => $user->getNomCommercial() ?? $user->getEmail(),
                'metadata' => [
                    'user_id' => $user->getId(),
                    'role' => $user->getRole()
                ]
            ]);

            return $customer;
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Failed to create Stripe customer: ' . $e->getMessage());
        }
    }

    public function createPaymentIntent(Appointment $appointment, string $customerId): PaymentIntent
    {
        try {
            $amount = $this->convertToCents($appointment->getBudget() ?? 0);
            
            $paymentIntent = PaymentIntent::create([
                'amount' => $amount,
                'currency' => 'tnd',
                'customer' => $customerId,
                'metadata' => [
                    'appointment_id' => $appointment->getId(),
                    'client_id' => $appointment->getClient()->getId(),
                    'provider_id' => $appointment->getProvider()->getId()
                ],
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return $paymentIntent;
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Failed to create payment intent: ' . $e->getMessage());
        }
    }

    public function createPaymentFromIntent(PaymentIntent $paymentIntent, Appointment $appointment): Payment
    {
        $payment = new Payment();
        $payment->setAppointment($appointment);
        $payment->setStripePaymentIntentId($paymentIntent->id);
        $payment->setStatus($paymentIntent->status);
        $payment->setAmount($this->convertFromCents($paymentIntent->amount));
        $payment->setCurrency($paymentIntent->currency);
        $payment->setStripeCustomerId($paymentIntent->customer);

        $this->paymentRepository->save($payment);

        return $payment;
    }

    public function updatePaymentStatus(string $paymentIntentId): ?Payment
    {
        try {
            $paymentIntent = PaymentIntent::retrieve($paymentIntentId);
            $payment = $this->paymentRepository->findByStripePaymentIntent($paymentIntentId);

            if ($payment) {
                $payment->setStatus($paymentIntent->status);
                
                if ($paymentIntent->status === 'succeeded') {
                    $payment->setCompletedAt(new \DateTime());
                } elseif (isset($paymentIntent->last_payment_error)) {
                    $payment->setFailureReason($paymentIntent->last_payment_error->message);
                }

                $this->paymentRepository->save($payment, true);
            }

            return $payment;
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Failed to update payment status: ' . $e->getMessage());
        }
    }

    public function refundPayment(Payment $payment, ?int $amount = null): \Stripe\Refund
    {
        try {
            $refundData = [
                'payment_intent' => $payment->getStripePaymentIntentId(),
            ];

            if ($amount !== null) {
                $refundData['amount'] = $this->convertToCents($amount);
            }

            $refund = \Stripe\Refund::create($refundData);

            // Update payment status if fully refunded
            if (!$amount || $amount >= (float) $payment->getAmount()) {
                $payment->setStatus('refunded');
                $this->paymentRepository->save($payment, true);
            }

            return $refund;
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Failed to process refund: ' . $e->getMessage());
        }
    }

    private function convertToCents(float $amount): int
    {
        return (int) round($amount * 100);
    }

    private function convertFromCents(int $cents): string
    {
        return number_format($cents / 100, 2, '.', '');
    }

    public function getPaymentMethods(string $customerId): array
    {
        try {
            $paymentMethods = \Stripe\PaymentMethod::all([
                'customer' => $customerId,
                'type' => 'card',
            ]);

            return $paymentMethods->data;
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Failed to retrieve payment methods: ' . $e->getMessage());
        }
    }

    public function createSetupIntent(string $customerId): \Stripe\SetupIntent
    {
        try {
            return \Stripe\SetupIntent::create([
                'customer' => $customerId,
                'usage' => 'off_session',
            ]);
        } catch (ApiErrorException $e) {
            throw new \RuntimeException('Failed to create setup intent: ' . $e->getMessage());
        }
    }
}
