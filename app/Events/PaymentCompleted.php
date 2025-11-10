<?php

namespace App\Events;

class PaymentCompleted extends BasePusherEvent
{
    protected $channelName = 'payments';
    protected $eventName = 'payment.completed';
}
