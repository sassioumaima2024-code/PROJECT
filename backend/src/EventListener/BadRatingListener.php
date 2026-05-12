<?php
namespace App\EventListener;

use App\Entity\Review;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Events;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use Psr\Log\LoggerInterface;

#[AsEntityListener(event: Events::postPersist, method: 'postPersist', entity: Review::class)]
class BadRatingListener
{
    public function __construct(private LoggerInterface $logger) {}

    public function postPersist(Review $review, LifecycleEventArgs $args): void
    {
        $rating = $review->getRating();
        $reviewee = $review->getReviewee();

        if ($rating < 2 && $reviewee instanceof User) {
            $count = $reviewee->getBadRatingsCount() + 1;
            $reviewee->setBadRatingsCount($count);

            if ($count >= 20) {
                $reviewee->setIsActive(false);
                $this->logger->warning("User {email} suspended due to 20 bad ratings", [
                    'email' => $reviewee->getEmail()
                ]);
                // TODO: Send email/notification about suspension
            } elseif ($count === 10 || $count === 15) {
                // TODO: Send warning notification
            }
            
            $args->getObjectManager()->flush();
        }
    }
}
