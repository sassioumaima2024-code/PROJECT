<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260422001423 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE appointment (id INT AUTO_INCREMENT NOT NULL, status VARCHAR(20) NOT NULL, scheduled_at DATETIME NOT NULL, description LONGTEXT DEFAULT NULL, photos JSON NOT NULL, budget DOUBLE PRECISION DEFAULT NULL, refusal_reason LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, client_id INT DEFAULT NULL, provider_id INT DEFAULT NULL, service_id INT DEFAULT NULL, INDEX IDX_FE38F84419EB6921 (client_id), INDEX IDX_FE38F844A53A8AA (provider_id), INDEX IDX_FE38F844ED5CA9E6 (service_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE review (id INT AUTO_INCREMENT NOT NULL, rating INT NOT NULL, comment LONGTEXT DEFAULT NULL, created_at DATETIME NOT NULL, client_id INT DEFAULT NULL, provider_id INT DEFAULT NULL, appointment_id INT DEFAULT NULL, INDEX IDX_794381C619EB6921 (client_id), INDEX IDX_794381C6A53A8AA (provider_id), INDEX IDX_794381C6E5B533F9 (appointment_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE service (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(100) NOT NULL, category VARCHAR(50) NOT NULL, price_min NUMERIC(8, 2) NOT NULL, price_max NUMERIC(8, 2) NOT NULL, experience INT NOT NULL, description LONGTEXT DEFAULT NULL, governorates JSON NOT NULL, photos JSON NOT NULL, is_active TINYINT NOT NULL, average_rating DOUBLE PRECISION DEFAULT NULL, created_at DATETIME NOT NULL, provider_id INT NOT NULL, INDEX IDX_E19D9AD2A53A8AA (provider_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL, nom_commercial VARCHAR(100) DEFAULT NULL, phone VARCHAR(20) DEFAULT NULL, profile_photo VARCHAR(255) DEFAULT NULL, is_active TINYINT NOT NULL, is_available_now TINYINT NOT NULL, bad_ratings_count INT NOT NULL, latitude DOUBLE PRECISION DEFAULT NULL, longitude DOUBLE PRECISION DEFAULT NULL, governorates JSON NOT NULL, categories JSON NOT NULL, created_at DATETIME NOT NULL, UNIQUE INDEX UNIQ_8D93D649E7927C74 (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_FE38F84419EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_FE38F844A53A8AA FOREIGN KEY (provider_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE appointment ADD CONSTRAINT FK_FE38F844ED5CA9E6 FOREIGN KEY (service_id) REFERENCES service (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C619EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C6A53A8AA FOREIGN KEY (provider_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE review ADD CONSTRAINT FK_794381C6E5B533F9 FOREIGN KEY (appointment_id) REFERENCES appointment (id)');
        $this->addSql('ALTER TABLE service ADD CONSTRAINT FK_E19D9AD2A53A8AA FOREIGN KEY (provider_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE appointment DROP FOREIGN KEY FK_FE38F84419EB6921');
        $this->addSql('ALTER TABLE appointment DROP FOREIGN KEY FK_FE38F844A53A8AA');
        $this->addSql('ALTER TABLE appointment DROP FOREIGN KEY FK_FE38F844ED5CA9E6');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C619EB6921');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C6A53A8AA');
        $this->addSql('ALTER TABLE review DROP FOREIGN KEY FK_794381C6E5B533F9');
        $this->addSql('ALTER TABLE service DROP FOREIGN KEY FK_E19D9AD2A53A8AA');
        $this->addSql('DROP TABLE appointment');
        $this->addSql('DROP TABLE review');
        $this->addSql('DROP TABLE service');
        $this->addSql('DROP TABLE `user`');
    }
}
