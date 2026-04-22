<?php
namespace App\DataFixtures;

use App\Entity\Governorate;
use App\Entity\Category;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // 24 Gouvernorats tunisiens
        $gouvernorats = [
            ['Tunis',        'تونس',          'TUN'],
            ['Ariana',       'أريانة',         'ARI'],
            ['Ben Arous',    'بن عروس',        'BEA'],
            ['Manouba',      'منوبة',          'MAN'],
            ['Nabeul',       'نابل',           'NAB'],
            ['Zaghouan',     'زغوان',          'ZAG'],
            ['Bizerte',      'بنزرت',          'BIZ'],
            ['Béja',         'باجة',           'BEJ'],
            ['Jendouba',     'جندوبة',         'JEN'],
            ['Kef',          'الكاف',          'KEF'],
            ['Siliana',      'سليانة',         'SIL'],
            ['Sousse',       'سوسة',           'SOU'],
            ['Monastir',     'المنستير',       'MON'],
            ['Mahdia',       'المهدية',        'MAH'],
            ['Sfax',         'صفاقس',          'SFA'],
            ['Kairouan',     'القيروان',       'KAI'],
            ['Kasserine',    'القصرين',        'KAS'],
            ['Sidi Bouzid',  'سيدي بوزيد',    'SBO'],
            ['Gabès',        'قابس',           'GAB'],
            ['Medenine',     'مدنين',          'MED'],
            ['Tataouine',    'تطاوين',         'TAT'],
            ['Gafsa',        'قفصة',           'GAF'],
            ['Tozeur',       'توزر',           'TOZ'],
            ['Kebili',       'قبلي',           'KEB'],
        ];

        foreach ($gouvernorats as [$fr, $ar, $code]) {
            $g = new Governorate();
            $g->setNameFr($fr);
            $g->setNameAr($ar);
            $g->setCode($code);
            $manager->persist($g);
        }

        // 15 Catégories de services
        $categories = [
            ['Plomberie',      'Réparation et installation plomberie',  '🔧'],
            ['Électricité',    'Installation et dépannage électrique',  '⚡'],
            ['Taxi',           'Transport et déplacement',              '🚕'],
            ['Ménage',         'Nettoyage et entretien maison',         '🧹'],
            ['Coiffure',       'Coiffure à domicile',                   '✂️'],
            ['Peinture',       'Peinture intérieure et extérieure',     '🎨'],
            ['Baby-sitter',    'Garde d\'enfants à domicile',           '👶'],
            ['Déménagement',   'Transport de meubles et déménagement',  '📦'],
            ['Jardinage',      'Entretien jardin et espaces verts',     '🌿'],
            ['Climatisation',  'Installation et entretien clim',        '❄️'],
            ['Informatique',   'Dépannage et assistance informatique',  '💻'],
            ['Cuisine',        'Chef à domicile et traiteur',           '👨‍🍳'],
            ['Photographie',   'Photographe événementiel',              '📷'],
            ['Cours',          'Cours particuliers et formation',       '📚'],
            ['Maçonnerie',     'Travaux de construction et rénovation', '🏗️'],
        ];

        foreach ($categories as [$name, $desc, $icon]) {
            $c = new Category();
            $c->setName($name);
            $c->setDescription($desc);
            $c->setIcon($icon);
            $manager->persist($c);
        }

        $manager->flush();
    }
}