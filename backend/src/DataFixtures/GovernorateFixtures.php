<?php
namespace App\DataFixtures;

use App\Entity\Governorate;
use App\Entity\Category;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class GovernorateFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $gouvernorates = [
            ['Tunis', 'تونس'],
            ['Ariana', 'أريانة'],
            ['Ben Arous', 'بن عروس'],
            ['Manouba', 'منوبة'],
            ['Nabeul', 'نابل'],
            ['Zaghouan', 'زغوان'],
            ['Bizerte', 'بنزرت'],
            ['Sousse', 'سوسة'],
            ['Monastir', 'المنستير'],
            ['Mahdia', 'المهدية'],
            ['Sfax', 'صفاقس'],
            ['Gafsa', 'قفصة'],
            ['Tozeur', 'توزر'],
            ['Kebili', 'قبلي'],
            ['Tatouine', 'تطاوين'],
            ['Medenine', 'مدنين'],
            ['Djerba', 'جربة'],
            ['Kasserine', 'القصرين'],
            ['Sidi Bouzid', 'سيدي بوزيد'],
            ['Kairouan', 'القيروان'],
            ['Kef', 'الكاف'],
            ['Jendouba', 'جندوبة'],
            ['Siliana', 'سليانة'],
            ['Béja', 'باجة'],
        ];

        foreach ($gouvernorates as [$fr, $ar]) {
            $g = new Governorate();
            $g->setName($fr);
            $g->setNameAr($ar);
            $manager->persist($g);
        }

        $manager->flush();
    }
}
