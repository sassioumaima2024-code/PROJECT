<?php
namespace App\DataFixtures;

use App\Entity\Category;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CategoryFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $categories = [
            'Plomberie', 'Électricité', 'Menage', 'Coiffure', 'Peinture',
            'Taxi', 'Baby-sitting', 'Jardinage', 'Réparation électroménager',
            'Serrurerie', 'Charpenterie', 'Carrelage', 'Maçonnerie',
            'Dépannage informatique', 'Coaching personnel', 'Cours particuliers',
        ];

        foreach ($categories as $name) {
            $c = new Category();
            $c->setName($name);
            $c->setIsActive(true);
            $manager->persist($c);
        }

        $manager->flush();
    }
}
