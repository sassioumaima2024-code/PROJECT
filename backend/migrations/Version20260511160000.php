<?php
declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260511160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add governorate relation to users, category relation to services, isUrgent column to appointments, and foreign key constraints.';
    }

    public function up(Schema $schema): void
    {
        // users.governorate_id (nullable)
        $this->addSql('ALTER TABLE `user` ADD governorate_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_user_governorate FOREIGN KEY (governorate_id) REFERENCES governorates(id) ON DELETE SET NULL');

        // service.category_id (not null)
        $this->addSql('ALTER TABLE service ADD category_id INT NOT NULL');
        $this->addSql('ALTER TABLE service ADD CONSTRAINT FK_service_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT');

        // appointment.is_urgent (default 0)
        $this->addSql('ALTER TABLE appointment ADD is_urgent TINYINT(1) NOT NULL DEFAULT 0');

        // add indexes for performance
        $this->addSql('CREATE INDEX IDX_user_governorate ON `user` (governorate_id)');
        $this->addSql('CREATE INDEX IDX_service_category ON service (category_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE appointment DROP is_urgent');
        $this->addSql('ALTER TABLE service DROP FOREIGN KEY FK_service_category');
        $this->addSql('ALTER TABLE service DROP category_id');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_user_governorate');
        $this->addSql('ALTER TABLE `user` DROP governorate_id');
        $this->addSql('DROP INDEX IDX_user_governorate ON `user`');
        $this->addSql('DROP INDEX IDX_service_category ON service');
    }
}
