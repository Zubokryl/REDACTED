<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DigitalOrderItem extends Model
{
    protected $fillable = [
        'digital_order_id',
        'model_id',
        'license_type',
        'price',
        'download_count',
        'downloaded_at',
    ];

    public function order()
    {
        return $this->belongsTo(DigitalOrder::class);
    }

    public function model()
    {
        return $this->belongsTo(Model3D::class, 'model_id');
    }

    public function canDownload(): bool
    {
        $maxDownloads = match ($this->license_type) {
            'personal' => 3,
            'commercial' => 10,
            'enterprise' => -1,
            default => 1,
        };

        return $maxDownloads < 0 || $this->download_count < $maxDownloads;
    }
public function incrementDownloadCount(): void
{
    $this->increment('download_count');
    $this->downloaded_at = now();
    $this->save();
}

      protected function maxDownloadsByLicense(): int
    {
        return match($this->license_type) {
            'personal' => 5,
            'commercial' => 10,
            'enterprise' => 100,
            default => 1,
        };
}
}