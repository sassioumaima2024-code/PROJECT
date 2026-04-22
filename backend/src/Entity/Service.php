<?php
namespace App\Entity;

use App\Repository\ServiceRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ServiceRepository::class)]
class Service
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private User $provider;

    #[ORM\Column(length: 100)]
    private string $title;

    #[ORM\Column(length: 50)]
    private string $category;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2)]
    private float $priceMin;

    #[ORM\Column(type: 'decimal', precision: 8, scale: 2)]
    private float $priceMax;

    #[ORM\Column(type: 'integer')]
    private int $experience = 0;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(type: 'json')]
    private array $governorates = [];

    #[ORM\Column(type: 'json')]
    private array $photos = [];

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $averageRating = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getProvider(): User { return $this->provider; }
    public function setProvider(User $p): self { $this->provider = $p; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $t): self { $this->title = $t; return $this; }
    public function getCategory(): string { return $this->category; }
    public function setCategory(string $c): self { $this->category = $c; return $this; }
    public function getPriceMin(): float { return $this->priceMin; }
    public function setPriceMin(float $v): self { $this->priceMin = $v; return $this; }
    public function getPriceMax(): float { return $this->priceMax; }
    public function setPriceMax(float $v): self { $this->priceMax = $v; return $this; }
    public function getExperience(): int { return $this->experience; }
    public function setExperience(int $v): self { $this->experience = $v; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $v): self { $this->description = $v; return $this; }
    public function getGovernorates(): array { return $this->governorates; }
    public function setGovernorates(array $v): self { $this->governorates = $v; return $this; }
    public function getPhotos(): array { return $this->photos; }
    public function setPhotos(array $v): self { $this->photos = $v; return $this; }
    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $v): self { $this->isActive = $v; return $this; }
    public function getAverageRating(): ?float { return $this->averageRating; }
    public function setAverageRating(?float $v): self { $this->averageRating = $v; return $this; }
}