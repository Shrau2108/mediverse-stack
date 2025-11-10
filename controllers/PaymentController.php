<?php
namespace App\Controllers;

use App\Models\Payment;

class PaymentController extends BaseController
{
    public function __construct(private readonly Payment $payments = new Payment()) {}

    public function store(): array
    {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        foreach (['bill_id','amount_cents','method','payer_id'] as $f) {
            if (!isset($input[$f])) {
                return $this->unprocessable("$f is required");
            }
        }
        try {
            $id = $this->payments->create($input);
            return $this->created(['id' => $id], 'Payment recorded');
        } catch (\Throwable $e) {
            return $this->badRequest('Unable to process payment');
        }
    }
}



