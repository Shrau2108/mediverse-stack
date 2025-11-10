<?php

namespace App\Services;

use Pusher\Pusher;

class PusherService
{
    protected $pusher;

    public function __construct()
    {
        $this->pusher = new Pusher(
            config('broadcasting.connections.pusher.key'),
            config('broadcasting.connections.pusher.secret'),
            config('broadcasting.connections.pusher.app_id'),
            [
                'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                'useTLS' => true,
                'encrypted' => true
            ]
        );
    }

    public function trigger(string $channel, string $event, array $data, string $socketId = null)
    {
        $params = [
            'channel' => $channel,
            'event' => $event,
            'data' => $data,
            'socket_id' => $socketId
        ];

        return $this->pusher->trigger($channel, $event, $data, $socketId);
    }
}
