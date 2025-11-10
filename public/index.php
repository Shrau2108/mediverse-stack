<?php
declare(strict_types=1);

use App\Routes\Router;

// Composer autoload (if installed)
$composerAutoload = __DIR__ . '/../vendor/autoload.php';
if (file_exists($composerAutoload)) {
    require $composerAutoload;
}

// Simple PSR-4 fallback autoloader for App\ namespace
spl_autoload_register(function ($class) {
    if (!str_starts_with($class, 'App\\')) {
        return;
    }
    $relative = str_replace('App\\', '', $class);
    $relative = str_replace('\\', '/', $relative);
    $path = __DIR__ . '/../' . $relative . '.php';
    if (file_exists($path)) {
        require $path;
    }
});

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Bootstrap router and register routes
$router = new Router();
$register = require __DIR__ . '/../routes/api.php';
$register($router);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri    = $_SERVER['REQUEST_URI'] ?? '/';
$router->dispatch($method, $uri);



