<?php

namespace App\Service;

use Sentry\State\Scope;
use function Sentry\configureScope;
use function Sentry\captureException;
use function Sentry\captureMessage;
use function Sentry\withScope;
use function Sentry\addBreadcrumb;
use function Sentry\setUser;
use function Sentry\setTag;
use function Sentry\setContext;

class SentryService
{
    public function __construct()
    {
        // Sentry is configured via environment variables
    }

    public function captureException(\Throwable $exception, array $extra = []): void
    {
        withScope(function (Scope $scope) use ($exception, $extra) {
            if (!empty($extra)) {
                $scope->setContext('extra', $extra);
            }

            captureException($exception);
        });
    }

    public function captureMessage(string $message, string $level = 'info', array $extra = []): void
    {
        withScope(function (Scope $scope) use ($message, $level, $extra) {
            if (!empty($extra)) {
                $scope->setContext('extra', $extra);
            }

            captureMessage($message, $level);
        });
    }

    public function setUser(array $user): void
    {
        configureScope(function (Scope $scope) use ($user) {
            $scope->setUser($user);
        });
    }

    public function setTag(string $key, string $value): void
    {
        configureScope(function (Scope $scope) use ($key, $value) {
            $scope->setTag($key, $value);
        });
    }

    public function setContext(string $key, array $context): void
    {
        configureScope(function (Scope $scope) use ($key, $context) {
            $scope->setContext($key, $context);
        });
    }

    public function addBreadcrumb(
        string $message,
        string $category = 'default',
        string $level = 'info',
        array $data = []
    ): void {
        addBreadcrumb([
            'message' => $message,
            'category' => $category,
            'level' => $level,
            'data' => $data,
        ]);
    }

    public function logApiRequest(
        string $method,
        string $endpoint,
        int $statusCode,
        float $duration,
        ?string $userId = null
    ): void {
        $this->addBreadcrumb(
            "API Request: $method $endpoint",
            'api',
            $statusCode < 400 ? 'info' : 'error',
            [
                'method' => $method,
                'endpoint' => $endpoint,
                'status_code' => $statusCode,
                'duration_ms' => round($duration * 1000),
                'user_id' => $userId,
            ]
        );
    }

    public function logDatabaseQuery(
        string $query,
        float $duration,
        int $rowCount = 0
    ): void {
        $this->addBreadcrumb(
            'Database Query',
            'database',
            $duration > 1.0 ? 'warning' : 'info',
            [
                'query' => substr($query, 0, 200), // Limit query length
                'duration_ms' => round($duration * 1000),
                'row_count' => $rowCount,
            ]
        );
    }

    public function logPaymentEvent(
        string $event,
        string $paymentId,
        float $amount,
        string $currency,
        ?string $userId = null
    ): void {
        $this->addBreadcrumb(
            "Payment Event: $event",
            'payment',
            'info',
            [
                'event' => $event,
                'payment_id' => $paymentId,
                'amount' => $amount,
                'currency' => $currency,
                'user_id' => $userId,
            ]
        );
    }

    public function logAuthEvent(
        string $event,
        ?string $userId = null,
        ?string $email = null
    ): void {
        $this->addBreadcrumb(
            "Auth Event: $event",
            'auth',
            $event === 'login_failed' ? 'warning' : 'info',
            [
                'event' => $event,
                'user_id' => $userId,
                'email' => $email,
            ]
        );
    }

    public function logBusinessEvent(
        string $event,
        array $data = []
    ): void {
        $this->addBreadcrumb(
            "Business Event: $event",
            'business',
            'info',
            $data
        );
    }

    public function logPerformanceMetric(
        string $metric,
        float $value,
        array $tags = []
    ): void {
        $this->addBreadcrumb(
            "Performance Metric: $metric",
            'performance',
            'info',
            array_merge([
                'metric' => $metric,
                'value' => $value,
            ], $tags)
        );
    }

    public function setUserFromToken(string $token): void
    {
        try {
            // Decode JWT token to get user info
            $payload = json_decode(base64_decode(str_replace('_', '/', str_replace('-', '+', explode('.', $token)[1]))), true);
            
            if (isset($payload['email'])) {
                $this->setUser([
                    'id' => $payload['id'] ?? null,
                    'email' => $payload['email'],
                    'role' => $payload['roles'][0] ?? 'user',
                ]);
            }
        } catch (\Exception $e) {
            // Invalid token, don't set user
        }
    }

    public function clearUser(): void
    {
        configureScope(function (Scope $scope) {
            $scope->setUser(null);
        });
    }

    public function setRequestContext(
        string $requestId,
        string $method,
        string $uri,
        array $headers = []
    ): void {
        $this->setContext('request', [
            'id' => $requestId,
            'method' => $method,
            'uri' => $uri,
            'headers' => $headers,
        ]);
    }

    public function setEnvironmentContext(
        string $environment,
        string $version,
        string $deployment = 'unknown'
    ): void {
        $this->setContext('environment', [
            'environment' => $environment,
            'version' => $version,
            'deployment' => $deployment,
        ]);
        
        $this->setTag('environment', $environment);
        $this->setTag('version', $version);
        $this->setTag('deployment', $deployment);
    }
}
