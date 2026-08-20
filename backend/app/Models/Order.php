<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'total',
        'shipping_cost',
        'shipping_courier',
        'shipping_service',
        'shipping_awb',
        'shipping_tracking',
        'payment_method',
        'payment_status',
        'midtrans_snap_token',
        'midtrans_order_id',
        'shipping_address',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'total' => 'float',
            'shipping_cost' => 'float',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}
