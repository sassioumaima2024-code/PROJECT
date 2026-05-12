<?php

namespace App\Controller;

use App\Entity\Appointment;
use App\Entity\Payment;
use App\Entity\User;
use App\Repository\AppointmentRepository;
use App\Repository\PaymentRepository;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/payments')]
class PaymentController extends AbstractController
{
    private StripeService $stripeService;
    private PaymentRepository $paymentRepository;
    private AppointmentRepository $appointmentRepository;
    private EntityManagerInterface $entityManager;

    public function __construct(
        StripeService $stripeService,
        PaymentRepository $paymentRepository,
        AppointmentRepository $appointmentRepository,
        EntityManagerInterface $entityManager
    ) {
        $this->stripeService = $stripeService;
        $this->paymentRepository = $paymentRepository;
        $this->appointmentRepository = $appointmentRepository;
        $this->entityManager = $entityManager;
    }

    #[Route('/config', name: 'payment_config', methods: ['GET'])]
    public function getConfig(): JsonResponse
    {
        return $this->json([
            'publishableKey' => $this->stripeService->getPublishableKey(),
            'currency' => 'tnd',
        ]);
    }

    #[Route('/create-customer', name: 'payment_create_customer', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createCustomer(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        try {
            $customer = $this->stripeService->createCustomer($user);
            
            return $this->json([
                'customerId' => $customer->id,
                'customerEmail' => $customer->email,
            ]);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/create-payment-intent', name: 'payment_create_intent', methods: ['POST'])]
    #[IsGranted('ROLE_CLIENT')]
    public function createPaymentIntent(Request $request): JsonResponse
    {
        /** @var User $client */
        $client = $this->getUser();
        
        $data = json_decode($request->getContent(), true);
        $appointmentId = $data['appointment_id'] ?? null;
        $customerId = $data['customer_id'] ?? null;

        if (!$appointmentId || !$customerId) {
            return $this->json(['error' => 'Missing appointment_id or customer_id'], Response::HTTP_BAD_REQUEST);
        }

        $appointment = $this->appointmentRepository->find($appointmentId);
        if (!$appointment) {
            return $this->json(['error' => 'Appointment not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if user owns this appointment
        if ($appointment->getClient()->getId() !== $client->getId()) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        // Check if payment already exists
        $existingPayment = $this->paymentRepository->findByAppointment($appointmentId);
        if ($existingPayment && $existingPayment->getStatus() !== 'canceled') {
            return $this->json(['error' => 'Payment already exists for this appointment'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $paymentIntent = $this->stripeService->createPaymentIntent($appointment, $customerId);
            $payment = $this->stripeService->createPaymentFromIntent($paymentIntent, $appointment);

            return $this->json([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentId' => $payment->getId(),
                'amount' => $payment->getAmount(),
                'currency' => $payment->getCurrency(),
            ]);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/confirm-payment/{paymentIntentId}', name: 'payment_confirm', methods: ['POST'])]
    public function confirmPayment(string $paymentIntentId): JsonResponse
    {
        try {
            $payment = $this->stripeService->updatePaymentStatus($paymentIntentId);
            
            if (!$payment) {
                return $this->json(['error' => 'Payment not found'], Response::HTTP_NOT_FOUND);
            }

            // Update appointment status if payment succeeded
            if ($payment->getStatus() === 'succeeded') {
                $appointment = $payment->getAppointment();
                $appointment->setStatus('confirmed');
                $this->entityManager->flush();
            }

            return $this->json([
                'status' => $payment->getStatus(),
                'paymentId' => $payment->getId(),
                'completedAt' => $payment->getCompletedAt()?->format('Y-m-d H:i:s'),
            ]);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/payment-methods/{customerId}', name: 'payment_methods', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPaymentMethods(string $customerId): JsonResponse
    {
        try {
            $paymentMethods = $this->stripeService->getPaymentMethods($customerId);
            
            $methods = array_map(function ($method) {
                return [
                    'id' => $method->id,
                    'type' => $method->type,
                    'card' => [
                        'brand' => $method->card->brand,
                        'last4' => $method->card->last4,
                        'exp_month' => $method->card->exp_month,
                        'exp_year' => $method->card->exp_year,
                    ],
                ];
            }, $paymentMethods);

            return $this->json(['paymentMethods' => $methods]);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/setup-intent/{customerId}', name: 'payment_setup_intent', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createSetupIntent(string $customerId): JsonResponse
    {
        try {
            $setupIntent = $this->stripeService->createSetupIntent($customerId);
            
            return $this->json([
                'clientSecret' => $setupIntent->client_secret,
            ]);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/refund/{paymentId}', name: 'payment_refund', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function refundPayment(int $paymentId, Request $request): JsonResponse
    {
        $payment = $this->paymentRepository->find($paymentId);
        if (!$payment) {
            return $this->json(['error' => 'Payment not found'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);
        $amount = $data['amount'] ?? null;

        try {
            $refund = $this->stripeService->refundPayment($payment, $amount);
            
            return $this->json([
                'refundId' => $refund->id,
                'amount' => $this->stripeService->convertFromCents($refund->amount),
                'status' => $refund->status,
            ]);
        } catch (\RuntimeException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/appointment/{appointmentId}', name: 'payment_by_appointment', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPaymentByAppointment(int $appointmentId): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        
        $appointment = $this->appointmentRepository->find($appointmentId);
        if (!$appointment) {
            return $this->json(['error' => 'Appointment not found'], Response::HTTP_NOT_FOUND);
        }

        // Check if user is involved in this appointment
        if ($appointment->getClient()->getId() !== $user->getId() && 
            $appointment->getProvider()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_FORBIDDEN);
        }

        $payment = $this->paymentRepository->findByAppointment($appointmentId);
        if (!$payment) {
            return $this->json(['error' => 'Payment not found'], Response::HTTP_NOT_FOUND);
        }

        return $this->json([
            'id' => $payment->getId(),
            'status' => $payment->getStatus(),
            'amount' => $payment->getAmount(),
            'currency' => $payment->getCurrency(),
            'createdAt' => $payment->getCreatedAt()->format('Y-m-d H:i:s'),
            'completedAt' => $payment->getCompletedAt()?->format('Y-m-d H:i:s'),
            'failureReason' => $payment->getFailureReason(),
        ]);
    }
}
