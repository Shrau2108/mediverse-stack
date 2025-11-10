<?php
namespace App\Controllers;

use App\Config\Database;

class WalletController extends BaseController
{
    public function current(): array
    {
        $db = Database::connection();
        $row = $db->query('SELECT balance_after_cents FROM hospital_wallet ORDER BY id DESC LIMIT 1')->fetch();
        $balance = (int)($row['balance_after_cents'] ?? 0);
        return $this->ok(['balance_cents' => $balance]);
    }
}



