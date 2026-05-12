<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Entity\Appointment;
use App\Entity\Payment;
use App\Entity\Message;
use App\Entity\Service;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class AnalyticsService
{
    private EntityManagerInterface $entityManager;
    private HttpClientInterface $httpClient;
    private SentryService $sentryService;
    private string $analyticsEndpoint;

    public function __construct(
        EntityManagerInterface $entityManager,
        HttpClientInterface $httpClient,
        SentryService $sentryService,
        string $analyticsEndpoint = null
    ) {
        $this->entityManager = $entityManager;
        $this->httpClient = $httpClient;
        $this->sentryService = $sentryService;
        $this->analyticsEndpoint = $analyticsEndpoint ?? $_ENV['ANALYTICS_ENDPOINT'] ?? null;
    }

    public function trackEvent(string $eventName, array $properties = [], ?User $user = null): void
    {
        $event = [
            'event' => $eventName,
            'properties' => $properties,
            'timestamp' => time(),
            'user_id' => $user?->getId(),
            'user_role' => $user?->getRole(),
            'environment' => $_ENV['APP_ENV'] ?? 'dev',
        ];

        // Send to analytics service
        $this->sendAnalyticsData($event);

        // Log to Sentry as breadcrumb
        $this->sentryService->addBreadcrumb(
            "Analytics Event: $eventName",
            'analytics',
            'info',
            $event
        );
    }

    public function trackUserRegistration(User $user): void
    {
        $this->trackEvent('user_registered', [
            'user_id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'registration_date' => $user->getCreatedAt()->format('Y-m-d H:i:s'),
            'phone_provided' => !empty($user->getPhone()),
            'governorates' => count($user->getGovernorates()),
            'categories' => count($user->getCategories()),
        ], $user);
    }

    public function trackUserLogin(User $user): void
    {
        $this->trackEvent('user_logged_in', [
            'user_id' => $user->getId(),
            'role' => $user->getRole(),
            'login_time' => date('Y-m-d H:i:s'),
            'is_first_login_today' => $this->isFirstLoginToday($user),
        ], $user);
    }

    public function trackAppointmentCreated(Appointment $appointment): void
    {
        $this->trackEvent('appointment_created', [
            'appointment_id' => $appointment->getId(),
            'client_id' => $appointment->getClient()->getId(),
            'provider_id' => $appointment->getProvider()->getId(),
            'service_id' => $appointment->getService()->getId(),
            'service_category' => $appointment->getService()->getCategory()->getName(),
            'budget' => $appointment->getBudget(),
            'scheduled_date' => $appointment->getScheduledAt()->format('Y-m-d H:i:s'),
            'is_urgent' => false, // Can be added later
            'has_photos' => !empty($appointment->getPhotos()),
        ], $appointment->getClient());
    }

    public function trackAppointmentStatusChange(Appointment $appointment, string $oldStatus, string $newStatus): void
    {
        $this->trackEvent('appointment_status_changed', [
            'appointment_id' => $appointment->getId(),
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'client_id' => $appointment->getClient()->getId(),
            'provider_id' => $appointment->getProvider()->getId(),
            'change_time' => date('Y-m-d H:i:s'),
            'time_to_accept' => $this->calculateTimeToAccept($appointment, $oldStatus, $newStatus),
        ], $appointment->getClient());
    }

    public function trackPaymentProcessed(Payment $payment): void
    {
        $this->trackEvent('payment_processed', [
            'payment_id' => $payment->getId(),
            'appointment_id' => $payment->getAppointment()->getId(),
            'amount' => $payment->getAmount(),
            'currency' => $payment->getCurrency(),
            'status' => $payment->getStatus(),
            'payment_method' => 'stripe', // Can be extended
            'client_id' => $payment->getAppointment()->getClient()->getId(),
            'provider_id' => $payment->getAppointment()->getProvider()->getId(),
            'processing_time' => $this->calculatePaymentProcessingTime($payment),
        ], $payment->getAppointment()->getClient());
    }

    public function trackServiceCreated(Service $service): void
    {
        $this->trackEvent('service_created', [
            'service_id' => $service->getId(),
            'provider_id' => $service->getProvider()->getId(),
            'category' => $service->getCategory()->getName(),
            'price' => $service->getPrice(),
            'experience_years' => $service->getExperienceYears(),
            'governorates_count' => count($service->getGovernorates()),
            'is_available_now' => $service->isAvailableNow(),
        ], $service->getProvider());
    }

    public function trackMessageSent(Message $message): void
    {
        $this->trackEvent('message_sent', [
            'message_id' => $message->getId(),
            'sender_id' => $message->getSender()->getId(),
            'recipient_id' => $message->getRecipient()->getId(),
            'has_attachments' => !empty($message->getAttachments()),
            'attachment_count' => count($message->getAttachments()),
            'is_appointment_related' => $message->getAppointment() !== null,
            'appointment_id' => $message->getAppointment()?->getId(),
            'message_length' => strlen($message->getContent()),
        ], $message->getSender());
    }

    public function trackServiceSearch(array $filters, int $resultCount): void
    {
        $this->trackEvent('service_searched', [
            'filters' => $filters,
            'result_count' => $resultCount,
            'search_time' => date('Y-m-d H:i:s'),
            'has_category_filter' => !empty($filters['category'] ?? []),
            'has_location_filter' => !empty($filters['governorat'] ?? []),
            'has_price_filter' => isset($filters['price_min']) || isset($filters['price_max']),
            'has_rating_filter' => isset($filters['min_rating']),
        ]);
    }

    public function trackProviderValidation(User $provider): void
    {
        $this->trackEvent('provider_validated', [
            'provider_id' => $provider->getId(),
            'validation_time' => date('Y-m-d H:i:s'),
            'registration_to_validation_days' => $this->calculateRegistrationToValidation($provider),
            'has_documents' => !empty($provider->getDocuments()),
            'services_count' => count($provider->getServices()),
        ], $provider);
    }

    public function trackProviderSuspension(User $provider, string $reason): void
    {
        $this->trackEvent('provider_suspended', [
            'provider_id' => $provider->getId(),
            'suspension_reason' => $reason,
            'suspension_time' => date('Y-m-d H:i:s'),
            'bad_ratings_count' => $provider->getBadRatingsCount(),
            'total_appointments' => $this->getTotalAppointmentsForProvider($provider),
            'average_rating' => $this->getProviderAverageRating($provider),
        ], $provider);
    }

    public function trackReviewSubmitted(array $reviewData): void
    {
        $this->trackEvent('review_submitted', [
            'appointment_id' => $reviewData['appointment_id'],
            'reviewer_id' => $reviewData['reviewer_id'],
            'reviewee_id' => $reviewData['reviewee_id'],
            'rating' => $reviewData['rating'],
            'has_comment' => !empty($reviewData['comment']),
            'comment_length' => strlen($reviewData['comment'] ?? ''),
            'has_criteria' => !empty($reviewData['criteria']),
            'criteria_scores' => $reviewData['criteria'] ?? [],
        ]);
    }

    public function getDashboardAnalytics(): array
    {
        $connection = $this->entityManager->getConnection();
        
        // Users analytics
        $totalUsers = $connection->fetchOne('SELECT COUNT(*) FROM user');
        $totalClients = $connection->fetchOne("SELECT COUNT(*) FROM user WHERE role = 'client'");
        $totalProviders = $connection->fetchOne("SELECT COUNT(*) FROM user WHERE role = 'prestataire'");
        $activeProviders = $connection->fetchOne("SELECT COUNT(*) FROM user WHERE role = 'prestataire' AND is_active = 1");
        
        // Appointments analytics
        $totalAppointments = $connection->fetchOne('SELECT COUNT(*) FROM appointments');
        $pendingAppointments = $connection->fetchOne("SELECT COUNT(*) FROM appointments WHERE status = 'pending'");
        $completedAppointments = $connection->fetchOne("SELECT COUNT(*) FROM appointments WHERE status = 'completed'");
        
        // Revenue analytics
        $totalRevenue = $connection->fetchOne('SELECT COALESCE(SUM(amount), 0) FROM payment WHERE status = "succeeded"');
        $monthlyRevenue = $connection->fetchOne("
            SELECT COALESCE(SUM(amount), 0) 
            FROM payment 
            WHERE status = 'succeeded' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        ");
        
        // Messages analytics
        $totalMessages = $connection->fetchOne('SELECT COUNT(*) FROM message');
        $unreadMessages = $connection->fetchOne('SELECT COUNT(*) FROM message WHERE read_at IS NULL');
        
        // Recent trends
        $newUsersThisMonth = $connection->fetchOne("
            SELECT COUNT(*) 
            FROM user 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        ");
        
        $appointmentsThisMonth = $connection->fetchOne("
            SELECT COUNT(*) 
            FROM appointments 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        ");
        
        return [
            'users' => [
                'total' => (int) $totalUsers,
                'clients' => (int) $totalClients,
                'providers' => (int) $totalProviders,
                'active_providers' => (int) $activeProviders,
                'new_this_month' => (int) $newUsersThisMonth,
            ],
            'appointments' => [
                'total' => (int) $totalAppointments,
                'pending' => (int) $pendingAppointments,
                'completed' => (int) $completedAppointments,
                'this_month' => (int) $appointmentsThisMonth,
            ],
            'revenue' => [
                'total' => (float) $totalRevenue,
                'monthly' => (float) $monthlyRevenue,
            ],
            'messages' => [
                'total' => (int) $totalMessages,
                'unread' => (int) $unreadMessages,
            ],
        ];
    }

    public function getProviderAnalytics(User $provider): array
    {
        $connection = $this->entityManager->getConnection();
        $providerId = $provider->getId();
        
        // Provider stats
        $totalAppointments = $connection->fetchOne("
            SELECT COUNT(*) 
            FROM appointments 
            WHERE provider_id = :provider_id
        ", ['provider_id' => $providerId]);
        
        $completedAppointments = $connection->fetchOne("
            SELECT COUNT(*) 
            FROM appointments 
            WHERE provider_id = :provider_id AND status = 'completed'
        ", ['provider_id' => $providerId]);
        
        $totalRevenue = $connection->fetchOne("
            SELECT COALESCE(SUM(p.amount), 0)
            FROM payment p
            JOIN appointments a ON p.appointment_id = a.id
            WHERE a.provider_id = :provider_id AND p.status = 'succeeded'
        ", ['provider_id' => $providerId]);
        
        $averageRating = $connection->fetchOne("
            SELECT COALESCE(AVG(rating), 0)
            FROM review
            WHERE reviewee_id = :provider_id
        ", ['provider_id' => $providerId]);
        
        $totalReviews = $connection->fetchOne("
            SELECT COUNT(*)
            FROM review
            WHERE reviewee_id = :provider_id
        ", ['provider_id' => $providerId]);
        
        return [
            'appointments' => [
                'total' => (int) $totalAppointments,
                'completed' => (int) $completedAppointments,
                'completion_rate' => $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 2) : 0,
            ],
            'revenue' => [
                'total' => (float) $totalRevenue,
                'average_per_appointment' => $completedAppointments > 0 ? round($totalRevenue / $completedAppointments, 2) : 0,
            ],
            'reviews' => [
                'total' => (int) $totalReviews,
                'average_rating' => round((float) $averageRating, 2),
            ],
        ];
    }

    private function sendAnalyticsData(array $data): void
    {
        if (!$this->analyticsEndpoint) {
            return;
        }

        try {
            $this->httpClient->request('POST', $this->analyticsEndpoint, [
                'json' => $data,
                'headers' => [
                    'Content-Type' => 'application/json',
                    'X-API-Key' => $_ENV['ANALYTICS_API_KEY'] ?? '',
                ],
            ]);
        } catch (\Exception $e) {
            // Log error but don't break the application
            $this->sentryService->captureException($e, [
                'analytics_data' => $data,
            ]);
        }
    }

    private function isFirstLoginToday(User $user): bool
    {
        // This would typically be tracked in a separate login log table
        // For now, return false as placeholder
        return false;
    }

    private function calculateTimeToAccept(Appointment $appointment, string $oldStatus, string $newStatus): ?float
    {
        if ($oldStatus === 'pending' && $newStatus === 'confirmed') {
            $created = $appointment->getCreatedAt();
            $now = new \DateTime();
            return $now->getTimestamp() - $created->getTimestamp();
        }
        return null;
    }

    private function calculatePaymentProcessingTime(Payment $payment): ?float
    {
        $created = $payment->getCreatedAt();
        $completed = $payment->getCompletedAt();
        
        if ($completed) {
            return $completed->getTimestamp() - $created->getTimestamp();
        }
        
        return null;
    }

    private function calculateRegistrationToValidation(User $provider): ?int
    {
        // This would typically track validation date
        // For now, return placeholder
        return null;
    }

    private function getTotalAppointmentsForProvider(User $provider): int
    {
        $connection = $this->entityManager->getConnection();
        return (int) $connection->fetchOne("
            SELECT COUNT(*) 
            FROM appointments 
            WHERE provider_id = :provider_id
        ", ['provider_id' => $provider->getId()]);
    }

    private function getProviderAverageRating(User $provider): float
    {
        $connection = $this->entityManager->getConnection();
        return (float) $connection->fetchOne("
            SELECT COALESCE(AVG(rating), 0)
            FROM review
            WHERE reviewee_id = :provider_id
        ", ['provider_id' => $provider->getId()]);
    }
}
