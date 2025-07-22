<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Payment extends Model
{
    protected $fillable = [
        'digital_order_id',
        'intent_id',
        'client_secret',
        'amount',
        'currency',
        'status',
    ];

    
   public function order()
{
    return $this->belongsTo(DigitalOrder::class, 'digital_order_id');
}

}