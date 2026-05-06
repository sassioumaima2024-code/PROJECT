<?php
namespace App\Controller;

use App\Entity\Service;
use App\Repository\ServiceRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class ServiceController extends AbstractController
{
    private function serializeService(Service $service): array
    {
        return [
            'id' => $service->getId(),
            'title' => $service->getTitle(),
            'category' => $service->getCategory(),
            'priceMin' => $service->getPriceMin(),
            'priceMax' => $service->getPriceMax(),
            'experience' => $service->getExperience(),
            'description' => $service->getDescription(),
            'governorates' => $service->getGovernorates(),
            'photos' => $service->getPhotos(),
            'isActive' => $service->isActive(),
            'averageRating' => $service->getAverageRating(),
        ];
    }

    #[Route('/services', methods: ['GET'])]
    public function index(Request $req, ServiceRepository $repo): JsonResponse
    {
        $filters = [
            'category'  => $req->query->get('category'),
            'gouvernorat' => $req->query->get('gouvernorat'),
            'price_min' => $req->query->get('price_min'),
            'price_max' => $req->query->get('price_max'),
            'rating'    => $req->query->get('rating'),
        ];
        $services = $repo->findWithFilters($filters);
        return $this->json(['data' => array_map(fn(Service $s) => $this->serializeService($s), $services)]);
    }

    #[Route('/services/{id}', methods: ['GET'])]
    public function show(Service $service): JsonResponse
    {
        return $this->json($this->serializeService($service));
    }

    #[Route('/provider/services', methods: ['GET'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function mine(ServiceRepository $repo): JsonResponse
    {
        $services = $repo->findBy(['provider' => $this->getUser()], ['id' => 'DESC']);
        return $this->json(['data' => array_map(fn(Service $s) => $this->serializeService($s), $services)]);
    }

    #[Route('/provider/services', methods: ['POST'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function create(Request $req, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($req->getContent(), true);
        $service = new Service();
        $service->setProvider($this->getUser());
        $service->setTitle($data['title']);
        $service->setCategory($data['category']);
        $service->setPriceMin($data['price_min']);
        $service->setPriceMax($data['price_max']);
        $service->setExperience($data['experience'] ?? 0);
        $service->setDescription($data['description'] ?? null);
        $service->setGovernorates($data['governorates'] ?? []);

        $em->persist($service);
        $em->flush();

        return $this->json(['message' => 'Service créé', 'id' => $service->getId()], 201);
    }

    #[Route('/provider/services/{id}', methods: ['PUT'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function update(Service $service, Request $req, EntityManagerInterface $em): JsonResponse
    {
        if ($service->getProvider() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }
        $data = json_decode($req->getContent(), true);
        if (isset($data['title']))       $service->setTitle($data['title']);
        if (isset($data['price_min']))   $service->setPriceMin($data['price_min']);
        if (isset($data['price_max']))   $service->setPriceMax($data['price_max']);
        if (isset($data['category']))    $service->setCategory($data['category']);
        if (isset($data['experience']))  $service->setExperience((int) $data['experience']);
        if (isset($data['description'])) $service->setDescription($data['description']);
        if (isset($data['governorates'])) $service->setGovernorates($data['governorates']);
        if (isset($data['photos']))      $service->setPhotos($data['photos']);
        $em->flush();
        return $this->json(['message' => 'Service mis à jour']);
    }

    #[Route('/provider/services/{id}/toggle', methods: ['PATCH'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function toggle(Service $service, EntityManagerInterface $em): JsonResponse
    {
        $service->setIsActive(!$service->isActive());
        $em->flush();
        return $this->json(['isActive' => $service->isActive()]);
    }

    #[Route('/provider/services/{id}', methods: ['DELETE'])]
    #[IsGranted('ROLE_PRESTATAIRE')]
    public function delete(Service $service, EntityManagerInterface $em): JsonResponse
    {
        if ($service->getProvider() !== $this->getUser()) {
            return $this->json(['error' => 'Accès refusé'], 403);
        }
        $em->remove($service);
        $em->flush();
        return $this->json(['message' => 'Service supprimé']);
    }
}
