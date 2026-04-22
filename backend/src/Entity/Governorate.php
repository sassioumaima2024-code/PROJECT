<?php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
class Governorate
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nameFr;

    #[ORM\Column(length: 100)]
    private string $nameAr;

    #[ORM\Column(length: 10, unique: true)]
    private string $code;

    public function getId(): ?int { return $this->id; }

    public function getNameFr(): string { return $this->nameFr; }
    public function setNameFr(string $n): self { $this->nameFr = $n; return $this; }

    public function getNameAr(): string { return $this->nameAr; }
    public function setNameAr(string $n): self { $this->nameAr = $n; return $this; }

    public function getCode(): string { return $this->code; }
    public function setCode(string $c): self { $this->code = $c; return $this; }
}
