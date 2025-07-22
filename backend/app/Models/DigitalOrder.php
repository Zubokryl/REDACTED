<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use App\Models\Model3D;
use App\Models\DigitalOrderItem;


class DigitalOrder extends Model
{
    protected $fillable = [
        'user_id',
        'price',
        'status',
        
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'price' => 'decimal:2'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

   


    public function markAsPaid(): void
    {
        $this->status = 'completed';
        $this->save();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'digital_order_id');
    }


    public static function licenseCoefficient(string $licenseType): float
    {
        return match($licenseType) {
            'personal' => 1.0,
            'commercial' => 1.5,
            'enterprise' => 2.0,
            default => 1.0,
        };
    }

    // Методы создания заказов: удаляем 'license_type' из create()

    public static function createOrderSingleModel(int $userId, int $modelId, string $licenseType): DigitalOrder
{
    return DB::transaction(function () use ($userId, $modelId, $licenseType) {
        $model = Model3D::findOrFail($modelId);
        $price = $model->price * self::licenseCoefficient($licenseType);

        $order = self::create([
            'user_id' => $userId,
            'price' => $price,
            'status' => 'pending',
        ]);

        DigitalOrderItem::create([
            'digital_order_id' => $order->id,
            'model_id' => $model->id,
            'license_type' => $licenseType,
            'price' => $price,
        ]);

        return $order;
    });
}

    public static function createBulkOrder(int $userId, array $items): DigitalOrder
{
    return DB::transaction(function () use ($userId, $items) {
        $totalPrice = 0;

        $order = self::create([
            'user_id' => $userId,
            'price' => 0,
            'status' => 'pending',
        ]);

        foreach ($items as $item) {
            $model = Model3D::findOrFail($item['model_id']);
            $licenseType = $item['license_type'];
            $price = $model->price * self::licenseCoefficient($licenseType);

            $totalPrice += $price;

            DigitalOrderItem::create([
                'digital_order_id' => $order->id,
                'model_id' => $model->id,
                'license_type' => $licenseType,
                'price' => $price,
            ]);
        }

        $order->update(['price' => $totalPrice]);

        return $order;
    });
}

    public static function createOrderAllModels(int $userId, string $licenseType): DigitalOrder
    {
        return DB::transaction(function () use ($userId, $licenseType) {
            $models = Model3D::all();
            $coefficient = self::licenseCoefficient($licenseType);
            $totalPrice = $models->sum('price') * $coefficient;

            $order = self::create([
                'user_id' => $userId,
                'price' => $totalPrice,
                'status' => 'pending',
            ]);

            // Вместо attach - создаём позиции заказа

            return $order;
        });
    }

    public function items()
{
    return $this->hasMany(DigitalOrderItem::class);
}

}