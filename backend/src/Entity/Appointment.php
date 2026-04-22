<?php
namespace App\Entity;

use App\Repository\AppointmentRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AppointmentRepository::class)]
class Appointment
{
    const STATUS_PENDING    = 'pending';
    const STATUS_CONFIRMED  = 'confirmed';
    const STATUS_IN_PROGRESS = 'in_progress';
    const STATUS_COMPLETED  = 'completed';
    const STATUS_CANCELLED  = 'cancelled';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private User $client;

    #[ORM\ManyToOne(targetEntity: User::class)]
    private User $provider;

    #[ORM\ManyToOne(targetEntity: Service::class)]
    private Service $service;

    #[ORM\Column(length: 20)]
    private string $status = self::STATUS_PENDING;

    #[ORM\Column(type: 'datetime')]
    private \DateTime $scheduledAt;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'json')]
    private array $photos = [];

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $budget = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $refusalReason = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getClient(): User { return $this->client; }
    public function setClient(User $u): self { $this->client = $u; return $this; }
    public function getProvider(): User { return $this->provider; }
    public function setProvider(User $u): self { $this->provider = $u; return $this; }
    public function getService(): Service { return $this->service; }
    public function setService(Service $s): self { $this->service = $s; return $this; }
    public function getStatus(): string { return $this->status; }
    public function setStatus(string $s): self { $this->status = $s; return $this; }
    public function getScheduledAt(): \DateTime { return $this->scheduledAt; }
    public function setScheduledAt(\DateTime $d): self { $this->scheduledAt = $d; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $v): self { $this->description = $v; return $this; }
    public function getPhotos(): array { return $this->photos; }
    public function setPhotos(array $v): self { $this->photos = $v; return $this; }
    public function getBudget(): ?float { return $this->budget; }
    public function setBudget(?float $v): self { $this->budget = $v; return $this; }
    public function getRefusalReason(): ?string { return $this->refusalReason; }
    public function setRefusalReason(?string $v): self { $this->refusalReason = $v; return $this; }
}