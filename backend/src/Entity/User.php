<?php
namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private string $email;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private string $password;

    #[ORM\Column(length: 50)]
    private string $role = 'client';

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $nomCommercial = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(nullable: true)]
    private ?string $profilePhoto = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    #[ORM\Column(type: 'boolean')]
    private bool $isAvailableNow = false;

    #[ORM\Column(type: 'integer')]
    private int $badRatingsCount = 0;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $latitude = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $longitude = null;

    #[ORM\Column(type: 'json')]
    private array $governorates = [];

    #[ORM\Column(type: 'json')]
    private array $categories = [];

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): self { $this->email = $email; return $this; }

    public function getUserIdentifier(): string { return $this->email; }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }
    public function setRoles(array $roles): self { $this->roles = $roles; return $this; }

    public function getPassword(): string { return $this->password; }
    public function setPassword(string $password): self { $this->password = $password; return $this; }

    public function eraseCredentials(): void {}

    public function getRole(): string { return $this->role; }
    public function setRole(string $role): self { $this->role = $role; return $this; }

    public function getNomCommercial(): ?string { return $this->nomCommercial; }
    public function setNomCommercial(?string $n): self { $this->nomCommercial = $n; return $this; }

    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $p): self { $this->phone = $p; return $this; }

    public function getProfilePhoto(): ?string { return $this->profilePhoto; }
    public function setProfilePhoto(?string $v): self { $this->profilePhoto = $v; return $this; }

    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $v): self { $this->isActive = $v; return $this; }

    public function isAvailableNow(): bool { return $this->isAvailableNow; }
    public function setIsAvailableNow(bool $v): self { $this->isAvailableNow = $v; return $this; }

    public function getBadRatingsCount(): int { return $this->badRatingsCount; }
    public function setBadRatingsCount(int $v): self { $this->badRatingsCount = $v; return $this; }

    public function getLatitude(): ?float { return $this->latitude; }
    public function setLatitude(?float $v): self { $this->latitude = $v; return $this; }

    public function getLongitude(): ?float { return $this->longitude; }
    public function setLongitude(?float $v): self { $this->longitude = $v; return $this; }

    public function getGovernorates(): array { return $this->governorates; }
    public function setGovernorates(array $v): self { $this->governorates = $v; return $this; }

    public function getCategories(): array { return $this->categories; }
    public function setCategories(array $v): self { $this->categories = $v; return $this; }
}