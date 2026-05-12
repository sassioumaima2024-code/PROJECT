<?php
namespace App\Controller;

use App\Repository\CategoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api')]
class CategoryController extends AbstractController
{
    #[Route('/categories', methods: ['GET'])]
    public function getCategories(CategoryRepository $repo): JsonResponse
    {
        $categories = $repo->findAll();
        $data = array_map(function($cat) {
            return [
                'id'          => $cat->getId(),
                'name'        => $cat->getName(),
                'description' => $cat->getDescription(),
                'icon'        => $cat->getIcon(),
            ];
        }, $categories);

        return $this->json($data);
    }
}
