<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260507010000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add provider registration files and OTP verification state.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` ADD portfolio JSON DEFAULT NULL, ADD documents JSON DEFAULT NULL, ADD otp_code VARCHAR(6) DEFAULT NULL, ADD otp_expires_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', ADD is_verified TINYINT NOT NULL DEFAULT 0');
        $this->addSql("UPDATE `user` SET portfolio = '[]' WHERE portfolio IS NULL");
        $this->addSql("UPDATE `user` SET documents = '[]' WHERE documents IS NULL");
        $this->addSql('ALTER TABLE `user` MODIFY portfolio JSON NOT NULL, MODIFY documents JSON NOT NULL, ALTER is_verified DROP DEFAULT');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE `user` DROP portfolio, DROP documents, DROP otp_code, DROP otp_expires_at, DROP is_verified');
    }
}
