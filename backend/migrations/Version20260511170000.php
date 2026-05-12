<?php
declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260511170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Make JSON columns nullable to avoid integrity constraint violations during fixtures.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` MODIFY governorates JSON DEFAULT NULL, MODIFY categories JSON DEFAULT NULL, MODIFY portfolio JSON DEFAULT NULL, MODIFY documents JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE service MODIFY governorates JSON DEFAULT NULL, MODIFY photos JSON DEFAULT NULL');
        $this->addSql('ALTER TABLE appointment MODIFY photos JSON DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // Not easily reversible without risking null issues
    }
}
