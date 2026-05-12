<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version2025051080002_CreateMessageTable extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create message table for user messaging system';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE message (
            id INT AUTO_INCREMENT NOT NULL,
            sender_id INT NOT NULL,
            recipient_id INT NOT NULL,
            appointment_id INT DEFAULT NULL,
            content TEXT NOT NULL,
            attachments JSON DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            read_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            status VARCHAR(20) NOT NULL DEFAULT \'sent\',
            INDEX IDX_MESSAGE_SENDER (sender_id),
            INDEX IDX_MESSAGE_RECIPIENT (recipient_id),
            INDEX IDX_MESSAGE_APPOINTMENT (appointment_id),
            INDEX IDX_MESSAGE_CREATED_AT (created_at),
            INDEX IDX_MESSAGE_STATUS (status),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE = InnoDB');

        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_MESSAGE_SENDER FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_MESSAGE_RECIPIENT FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_MESSAGE_APPOINTMENT FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_MESSAGE_SENDER');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_MESSAGE_RECIPIENT');
        $this->addSql('ALTER TABLE message DROP FOREIGN KEY FK_MESSAGE_APPOINTMENT');
        $this->addSql('DROP TABLE message');
    }
}
