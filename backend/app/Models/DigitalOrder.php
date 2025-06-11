<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DigitalOrder extends Model
{
    protected $fillable = [
        'user_id',
        'model_id',
        'price',
        'license_type',
        'status',
        'downloaded_at',
        'download_count'
    ];

    protected $casts = [
        'downloaded_at' => 'datetime',
        'price' => 'decimal:2'
    ];

    // Отношения
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(Model3D::class, 'model_id');
    }

    // Методы
    public function canDownload(): bool
    {
        return $this->status === 'completed' && 
               $this->download_count < $this->getMaxDownloads();
    }

    public function incrementDownloadCount(): void
    {
        $this->increment('download_count');
        $this->downloaded_at = now();
        $this->save();
    }

    private function getMaxDownloads(): int
    {
        return match($this->license_type) {
            'personal' => 3,
            'commercial' => 10,
            'enterprise' => -1, // unlimited
            default => 1
        };
    }
} 