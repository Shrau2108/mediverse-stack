<?php

namespace App\Events;

class PrescriptionCreated extends BasePusherEvent
{
    protected $channelName = 'prescriptions';
    protected $eventName = 'prescription.created';
}
