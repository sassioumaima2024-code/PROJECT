<?php
namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $address = null;

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

    #[ORM\Column(type: 'json')]
    private array $portfolio = [];

    #[ORM\Column(type: 'json')]
    private array $documents = [];

    #[ORM\Column(length: 6, nullable: true)]
    private ?string $otpCode = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $otpExpiresAt = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isVerified = false;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $metadata = null;

    #[ORM\Column(type: 'float', nullable: true)]
    private ?float $averageRating = null;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\OneToMany(mappedBy: 'sender', targetEntity: Message::class)]
    private Collection $sentMessages;

    #[ORM\OneToMany(mappedBy: 'recipient', targetEntity: Message::class)]
    private Collection $receivedMessages;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->sentMessages = new ArrayCollection();
        $this->receivedMessages = new ArrayCollection();
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

    public function getAddress(): ?string { return $this->address; }
    public function setAddress(?string $a): self { $this->address = $a; return $this; }

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

    public function getPortfolio(): array { return $this->portfolio; }
    public function setPortfolio(array $v): self { $this->portfolio = $v; return $this; }

    public function getDocuments(): array { return $this->documents; }
    public function setDocuments(array $v): self { $this->documents = $v; return $this; }

    public function getOtpCode(): ?string { return $this->otpCode; }
    public function setOtpCode(?string $v): self { $this->otpCode = $v; return $this; }

    public function getOtpExpiresAt(): ?\DateTimeImmutable { return $this->otpExpiresAt; }
    public function setOtpExpiresAt(?\DateTimeImmutable $v): self { $this->otpExpiresAt = $v; return $this; }

    public function isVerified(): bool { return $this->isVerified; }
    public function setIsVerified(bool $v): self { $this->isVerified = $v; return $this; }

    public function getMetadata(): ?array { return $this->metadata; }
    public function setMetadata(?array $metadata): self { $this->metadata = $metadata; return $this; }

    public function getAverageRating(): ?float { return $this->averageRating; }
    public function setAverageRating(?float $v): self { $this->averageRating = $v; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $v): self { $this->description = $v; return $this; }

    public function getSentMessages(): Collection { return $this->sentMessages; }
    
    public function addSentMessage(Message $message): self {
        if (!$this->sentMessages->contains($message)) {
            $this->sentMessages->add($message);
            $message->setSender($this);
        }
        return $this;
    }
    
    public function removeSentMessage(Message $message): self {
        if ($this->sentMessages->removeElement($message)) {
            if ($message->getSender() === $this) {
                $message->setSender(null);
            }
        }
        return $this;
    }

    public function getReceivedMessages(): Collection { return $this->receivedMessages; }
    
    public function addReceivedMessage(Message $message): self {
        if (!$this->receivedMessages->contains($message)) {
            $this->receivedMessages->add($message);
            $message->setRecipient($this);
        }
        return $this;
    }
    
    public function removeReceivedMessage(Message $message): self {
        if ($this->receivedMessages->removeElement($message)) {
            if ($message->getRecipient() === $this) {
                $message->setRecipient(null);
            }
        }
        return $this;
    }

    public function getAllMessages(): Collection {
        return new ArrayCollection(array_merge(
            $this->sentMessages->toArray(),
            $this->receivedMessages->toArray()
        ));
    }
}
