<?php

namespace App\Events;

class LabReportUploaded extends BasePusherEvent
{
    protected $channelName = 'lab-reports';
    protected $eventName = 'lab.report.uploaded';
}
