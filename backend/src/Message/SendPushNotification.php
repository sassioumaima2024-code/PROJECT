<?php
namespace App\Message;

class SendPushNotification
{
    public function __construct(
        private int $userId,
        private string $title,
        private string $body,
        private string $type
    ) {}

    public function getUserId(): int
    {
        return $this->userId;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getType(): string
    {
        return $this->type;
    }
}
