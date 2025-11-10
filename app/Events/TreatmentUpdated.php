<?php

namespace App\Events;

class TreatmentUpdated extends BasePusherEvent
{
    protected $channelName = 'treatments';
    protected $eventName = 'treatment.updated';
}
