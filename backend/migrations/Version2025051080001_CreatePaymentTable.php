<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version2025051080001_CreatePaymentTable extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create payment table for Stripe integration';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE payment (
            id INT AUTO_INCREMENT NOT NULL,
            appointment_id INT NOT NULL,
            stripe_payment_intent_id VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT \'TND\',
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            completed_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            failure_reason TEXT DEFAULT NULL,
            stripe_customer_id VARCHAR(255) DEFAULT NULL,
            INDEX IDX_PAYMENT_APPOINTMENT (appointment_id),
            UNIQUE INDEX UNIQ_PAYMENT_STRIPE_PAYMENT_INTENT_ID (stripe_payment_intent_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        $this->addSql('ALTER TABLE payment ADD CONSTRAINT FK_PAYMENT_APPOINTMENT FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE payment DROP FOREIGN KEY FK_PAYMENT_APPOINTMENT');
        $this->addSql('DROP TABLE payment');
    }
}
