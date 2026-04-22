<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Category
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100, unique: true)]
    private string $name;

    #[ORM\Column(type: 'text', nullable: true)]
    private ?string $description = null;

    #[ORM\Column(nullable: true)]
    private ?string $icon = null;

    #[ORM\Column(type: 'boolean')]
    private bool $isActive = true;

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $n): self { $this->name = $n; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $d): self { $this->description = $d; return $this; }
    public function getIcon(): ?string { return $this->icon; }
    public function setIcon(?string $i): self { $this->icon = $i; return $this; }
    public function isActive(): bool { return $this->isActive; }
    public function setIsActive(bool $v): self { $this->isActive = $v; return $this; }
}