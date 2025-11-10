<?php
namespace App\Config;

class Env
{
    private static array $cache = [];

    public static function load(string $path = __DIR__ . '/../.env'): void
    {
        if (!file_exists($path)) {
            // Try alternative path (env.example)
            $alt = __DIR__ . '/../env.example';
            if (!file_exists($alt)) {
                return;
            }
            $path = $alt;
        }
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            if (str_starts_with(trim($line), '#')) {
                continue;
            }
            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }
            [$key, $value] = $parts;
            $key = trim($key);
            $value = trim($value);
            $value = trim($value, "\"' ");
            self::$cache[$key] = $value;
            if (!isset($_ENV[$key])) {
                $_ENV[$key] = $value;
            }
            if (!getenv($key)) {
                putenv($key . '=' . $value);
            }
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        return $_ENV[$key] ?? getenv($key) ?: (self::$cache[$key] ?? $default);
    }
}



