<?php
namespace App\Routes;

class Router
{
    private array $routes = [];

    public function get(string $path, callable|array $handler): void
    {
        $this->map('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void
    {
        $this->map('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): void
    {
        $this->map('PUT', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): void
    {
        $this->map('DELETE', $path, $handler);
    }

    private function map(string $method, string $path, callable|array $handler): void
    {
        $this->routes[$method][$this->normalize($path)] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $path = $this->normalize($path);
        $routes = $this->routes[$method] ?? [];

        // Simple path and path with numeric id support: /patients/{id}
        if (isset($routes[$path])) {
            $this->invoke($routes[$path]);
            return;
        }

        foreach ($routes as $routePath => $handler) {
            $pattern = preg_replace('#\{id\}#', '(\\d+)', $routePath);
            $pattern = '#^' . $pattern . '$#';
            if (preg_match($pattern, $path, $matches)) {
                array_shift($matches);
                $this->invoke($handler, $matches);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
    }

    private function normalize(string $path): string
    {
        $path = rtrim($path, '/');
        return $path === '' ? '/' : $path;
    }

    private function invoke(callable|array $handler, array $params = []): void
    {
        header('Content-Type: application/json');
        if (is_array($handler)) {
            [$class, $method] = $handler;
            $instance = is_string($class) ? new $class() : $class;
            echo json_encode(call_user_func_array([$instance, $method], $params));
            return;
        }
        echo json_encode(call_user_func_array($handler, $params));
    }
}



