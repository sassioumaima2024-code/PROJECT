<?php
declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260511155000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create governorates and categories tables.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE governorates (id INT AUTO_INCREMENT NOT NULL, name_fr VARCHAR(100) NOT NULL, name_ar VARCHAR(100) NOT NULL, code VARCHAR(10) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE categories (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) NOT NULL, description LONGTEXT DEFAULT NULL, icon VARCHAR(50) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE governorates');
        $this->addSql('DROP TABLE categories');
    }
}
