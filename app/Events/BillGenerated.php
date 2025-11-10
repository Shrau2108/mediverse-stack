<?php

namespace App\Events;

class BillGenerated extends BasePusherEvent
{
    protected $channelName = 'bills';
    protected $eventName = 'bill.generated';
}
