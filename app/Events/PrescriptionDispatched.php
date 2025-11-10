<?php

namespace App\Events;

class PrescriptionDispatched extends BasePusherEvent
{
    protected $channelName = 'prescriptions';
    protected $eventName = 'prescription.dispatched';
}
