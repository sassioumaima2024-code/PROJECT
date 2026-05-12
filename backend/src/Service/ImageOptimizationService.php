<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ImageOptimizationService
{
    private string $uploadDir;
    private array $allowedMimeTypes;
    private array $imageSizes;

    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->uploadDir = $parameterBag->get('kernel.project_dir') . '/public/uploads';
        $this->allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];
        $this->imageSizes = [
            'thumbnail' => [150, 150],
            'small' => [300, 300],
            'medium' => [600, 600],
            'large' => [1200, 1200],
        ];
    }

    public function optimizeAndSave(UploadedFile $file, string $category = 'general'): array
    {
        $this->validateFile($file);
        
        $originalFilename = $this->generateUniqueFilename($file);
        $categoryDir = $this->uploadDir . '/' . $category;
        $this->ensureDirectoryExists($categoryDir);

        $originalPath = $categoryDir . '/' . $originalFilename;
        
        // Save original file
        $file->move($categoryDir, $originalFilename);

        $optimizedImages = [
            'original' => '/uploads/' . $category . '/' . $originalFilename,
        ];

        // Create optimized versions
        foreach ($this->imageSizes as $sizeName => [$width, $height]) {
            $optimizedFilename = $this->generateOptimizedFilename($originalFilename, $sizeName);
            $optimizedPath = $categoryDir . '/' . $optimizedFilename;
            
            if ($this->createOptimizedVersion($originalPath, $optimizedPath, $width, $height)) {
                $optimizedImages[$sizeName] = '/uploads/' . $category . '/' . $optimizedFilename;
            }
        }

        // Create WebP versions
        $webpImages = $this->createWebPVersions($originalPath, $categoryDir, $originalFilename);
        $optimizedImages = array_merge($optimizedImages, $webpImages);

        return $optimizedImages;
    }

    public function optimizeExistingImage(string $imagePath): array
    {
        $fullPath = $this->uploadDir . '/' . ltrim($imagePath, '/');
        
        if (!file_exists($fullPath)) {
            throw new \InvalidArgumentException('Image file not found');
        }

        $pathInfo = pathinfo($fullPath);
        $category = $this->extractCategoryFromPath($imagePath);
        $filename = $pathInfo['basename'];

        $optimizedImages = [
            'original' => $imagePath,
        ];

        foreach ($this->imageSizes as $sizeName => [$width, $height]) {
            $optimizedFilename = $this->generateOptimizedFilename($filename, $sizeName);
            $optimizedPath = $pathInfo['dirname'] . '/' . $optimizedFilename;
            
            if ($this->createOptimizedVersion($fullPath, $optimizedPath, $width, $height)) {
                $relativePath = str_replace($this->uploadDir, '', $optimizedPath);
                $optimizedImages[$sizeName] = $relativePath;
            }
        }

        return $optimizedImages;
    }

    public function getOptimalImageUrl(string $originalUrl, string $size = 'medium'): string
    {
        $pathInfo = pathinfo($originalUrl);
        $filename = $pathInfo['filename'];
        $extension = $pathInfo['extension'];
        
        // Try WebP first
        $webpUrl = str_replace($filename . '.' . $extension, $filename . '_' . $size . '.webp', $originalUrl);
        if ($this->fileExists($webpUrl)) {
            return $webpUrl;
        }
        
        // Fallback to optimized version
        $optimizedUrl = str_replace($filename . '.' . $extension, $filename . '_' . $size . '.' . $extension, $originalUrl);
        if ($this->fileExists($optimizedUrl)) {
            return $optimizedUrl;
        }
        
        return $originalUrl;
    }

    public function generateResponsiveImages(string $imageUrl): array
    {
        $responsive = [];
        $pathInfo = pathinfo($imageUrl);
        $filename = $pathInfo['filename'];
        $extension = $pathInfo['extension'];

        foreach ($this->imageSizes as $sizeName => [$width, $height]) {
            $optimizedUrl = $this->getOptimalImageUrl($imageUrl, $sizeName);
            $responsive[$sizeName] = [
                'url' => $optimizedUrl,
                'width' => $width,
                'height' => $height,
            ];
        }

        return $responsive;
    }

    public function cleanupUnusedImages(array $usedImages): void
    {
        $allImages = $this->getAllUploadedImages();
        $unusedImages = array_diff($allImages, $usedImages);

        foreach ($unusedImages as $image) {
            $fullPath = $this->uploadDir . '/' . ltrim($image, '/');
            if (file_exists($fullPath) && !is_dir($fullPath)) {
                unlink($fullPath);
            }
        }
    }

    public function getImageInfo(string $imagePath): array
    {
        $fullPath = $this->uploadDir . '/' . ltrim($imagePath, '/');
        
        if (!file_exists($fullPath)) {
            return [];
        }

        $imageInfo = getimagesize($fullPath);
        $fileSize = filesize($fullPath);

        return [
            'width' => $imageInfo[0] ?? null,
            'height' => $imageInfo[1] ?? null,
            'mime_type' => $imageInfo['mime'] ?? null,
            'file_size' => $fileSize,
            'file_size_mb' => round($fileSize / 1024 / 1024, 2),
        ];
    }

    public function compressImage(string $imagePath, int $quality = 85): bool
    {
        $fullPath = $this->uploadDir . '/' . ltrim($imagePath, '/');
        
        if (!file_exists($fullPath)) {
            return false;
        }

        $imageInfo = getimagesize($fullPath);
        $mimeType = $imageInfo['mime'];

        switch ($mimeType) {
            case 'image/jpeg':
                $image = imagecreatefromjpeg($fullPath);
                imagejpeg($image, $fullPath, $quality);
                break;
            case 'image/png':
                $image = imagecreatefrompng($fullPath);
                $compression = 9 - round($quality / 10);
                imagepng($image, $fullPath, $compression);
                break;
            case 'image/gif':
                // GIF compression is limited
                $image = imagecreatefromgif($fullPath);
                imagegif($image, $fullPath);
                break;
            default:
                return false;
        }

        imagedestroy($image);
        return true;
    }

    private function validateFile(UploadedFile $file): void
    {
        if (!in_array($file->getMimeType(), $this->allowedMimeTypes)) {
            throw new \InvalidArgumentException('File type not allowed');
        }

        $maxSize = 10 * 1024 * 1024; // 10MB
        if ($file->getSize() > $maxSize) {
            throw new \InvalidArgumentException('File too large');
        }

        $imageInfo = @getimagesize($file->getPathname());
        if ($imageInfo === false) {
            throw new \InvalidArgumentException('Invalid image file');
        }
    }

    private function generateUniqueFilename(UploadedFile $file): string
    {
        $extension = $file->guessExtension();
        return uniqid() . '_' . time() . '.' . $extension;
    }

    private function generateOptimizedFilename(string $originalFilename, string $size): string
    {
        $pathInfo = pathinfo($originalFilename);
        return $pathInfo['filename'] . '_' . $size . '.' . $pathInfo['extension'];
    }

    private function ensureDirectoryExists(string $directory): void
    {
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
    }

    private function createOptimizedVersion(string $originalPath, string $optimizedPath, int $width, int $height): bool
    {
        try {
            $imageInfo = getimagesize($originalPath);
            if ($imageInfo === false) {
                return false;
            }

            $originalWidth = $imageInfo[0];
            $originalHeight = $imageInfo[1];
            $mimeType = $imageInfo['mime'];

            // Calculate dimensions maintaining aspect ratio
            $dimensions = $this->calculateDimensions($originalWidth, $originalHeight, $width, $height);
            $newWidth = $dimensions['width'];
            $newHeight = $dimensions['height'];

            // Create image resource
            $image = $this->createImageResource($originalPath, $mimeType);
            if ($image === false) {
                return false;
            }

            // Create new image
            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            
            // Handle transparency for PNG
            if ($mimeType === 'image/png') {
                imagealphablending($newImage, false);
                imagesavealpha($newImage, true);
                $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
                imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            // Resize image
            imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

            // Save optimized image
            $result = $this->saveImage($newImage, $optimizedPath, $mimeType, 85);

            imagedestroy($image);
            imagedestroy($newImage);

            return $result;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function createWebPVersions(string $originalPath, string $categoryDir, string $originalFilename): array
    {
        $webpImages = [];
        
        if (!function_exists('imagewebp')) {
            return $webpImages; // WebP not supported
        }

        foreach ($this->imageSizes as $sizeName => [$width, $height]) {
            $webpFilename = $this->generateWebpFilename($originalFilename, $sizeName);
            $webpPath = $categoryDir . '/' . $webpFilename;
            
            if ($this->createWebPVersion($originalPath, $webpPath, $width, $height)) {
                $webpImages[$sizeName . '_webp'] = '/uploads/' . basename($categoryDir) . '/' . $webpFilename;
            }
        }

        return $webpImages;
    }

    private function createWebPVersion(string $originalPath, string $webpPath, int $width, int $height): bool
    {
        try {
            $imageInfo = getimagesize($originalPath);
            if ($imageInfo === false) {
                return false;
            }

            $originalWidth = $imageInfo[0];
            $originalHeight = $imageInfo[1];
            $mimeType = $imageInfo['mime'];

            $dimensions = $this->calculateDimensions($originalWidth, $originalHeight, $width, $height);
            $newWidth = $dimensions['width'];
            $newHeight = $dimensions['height'];

            $image = $this->createImageResource($originalPath, $mimeType);
            if ($image === false) {
                return false;
            }

            $newImage = imagecreatetruecolor($newWidth, $newHeight);
            
            if ($mimeType === 'image/png') {
                imagealphablending($newImage, false);
                imagesavealpha($newImage, true);
                $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
                imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);

            $result = imagewebp($newImage, $webpPath, 85);

            imagedestroy($image);
            imagedestroy($newImage);

            return $result;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function calculateDimensions(int $originalWidth, int $originalHeight, int $maxWidth, int $maxHeight): array
    {
        if ($originalWidth <= $maxWidth && $originalHeight <= $maxHeight) {
            return ['width' => $originalWidth, 'height' => $originalHeight];
        }

        $widthRatio = $maxWidth / $originalWidth;
        $heightRatio = $maxHeight / $originalHeight;
        $ratio = min($widthRatio, $heightRatio);

        return [
            'width' => (int) round($originalWidth * $ratio),
            'height' => (int) round($originalHeight * $ratio),
        ];
    }

    private function createImageResource(string $imagePath, string $mimeType)
    {
        switch ($mimeType) {
            case 'image/jpeg':
                return imagecreatefromjpeg($imagePath);
            case 'image/png':
                return imagecreatefrompng($imagePath);
            case 'image/gif':
                return imagecreatefromgif($imagePath);
            case 'image/webp':
                return imagecreatefromwebp($imagePath);
            default:
                return false;
        }
    }

    private function saveImage($image, string $path, string $mimeType, int $quality): bool
    {
        switch ($mimeType) {
            case 'image/jpeg':
                return imagejpeg($image, $path, $quality);
            case 'image/png':
                $compression = 9 - round($quality / 10);
                return imagepng($image, $path, $compression);
            case 'image/gif':
                return imagegif($image, $path);
            case 'image/webp':
                return imagewebp($image, $path, $quality);
            default:
                return false;
        }
    }

    private function generateWebpFilename(string $originalFilename, string $size): string
    {
        $pathInfo = pathinfo($originalFilename);
        return $pathInfo['filename'] . '_' . $size . '.webp';
    }

    private function extractCategoryFromPath(string $imagePath): string
    {
        $parts = explode('/', $imagePath);
        return $parts[1] ?? 'general';
    }

    private function fileExists(string $url): bool
    {
        $path = $this->uploadDir . '/' . ltrim($url, '/');
        return file_exists($path);
    }

    private function getAllUploadedImages(): array
    {
        $images = [];
        $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->uploadDir));
        
        foreach ($iterator as $file) {
            if ($file->isFile() && in_array($file->getExtension(), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $images[] = str_replace($this->uploadDir, '', $file->getPathname());
            }
        }
        
        return $images;
    }
}
