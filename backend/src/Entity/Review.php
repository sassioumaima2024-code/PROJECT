<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Review
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private User $client;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private User $provider;

    #[ORM\ManyToOne(targetEntity: Appointment::class)]
    private Appointment $appointment;

    #[ORM\Column(type: 'integer')]
    private int $rating; // 1-5

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $comment = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct() { $this->createdAt = new \DateTimeImmutable(); }
    public function getId(): ?int { return $this->id; }
    public function getClient(): User { return $this->client; }
    public function setClient(User $u): self { $this->client = $u; return $this; }
    public function getProvider(): User { return $this->provider; }
    public function setProvider(User $u): self { $this->provider = $u; return $this; }
    public function getAppointment(): Appointment { return $this->appointment; }
    public function setAppointment(Appointment $a): self { $this->appointment = $a; return $this; }
    public function getRating(): int { return $this->rating; }
    public function setRating(int $r): self { $this->rating = $r; return $this; }
    public function getComment(): ?string { return $this->comment; }
    public function setComment(?string $c): self { $this->comment = $c; return $this; }
}