<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Model3D extends Model
{
     use HasFactory;
  
    protected $table = 'models';


    protected $fillable = [
        'creator_id',
        'title',
        'description',
        'category',
        'price',
        'available_licenses',
        'formats',
        'features',
        'vertices',
        'printable',
        'tools',
        'tags',
        'materials',
        'customizable',
        'release_date',
        'model_file',
        'preview_image',
        'preview_video',
        'tbscene_file',
        'texture_files',
    ];

 
    protected $casts = [
        'formats' => 'array',
        'features' => 'array',
        'tools' => 'array',
        'tags' => 'array',
        'materials' => 'array',
        'images' => 'array',
        'texture_files' => 'array',
        'printable' => 'boolean',
        'customizable' => 'boolean',
        'release_date' => 'date',
        'price' => 'float',
        'available_licenses' => 'array',
    ];

    protected $appends = ['model_file_url', 'preview_image_url', 'tbscene_file_url', 'texture_files_urls']; 

    public function getModelFileUrlAttribute()
    {
        return $this->model_file ? asset('storage/models/' . $this->model_file) : null;
    }

    public function getPreviewImageUrlAttribute()
    {
        return $this->preview_image ? asset('storage/previews/' . $this->preview_image) : null;
    }
    
    public function getTbsceneFileUrlAttribute()
    {
        return $this->tbscene_file ? asset('storage/tbscenes/' . $this->tbscene_file) : null;
    }
    
    public function getTextureFilesUrlsAttribute()
    {
        if (!$this->texture_files) {
            return [];
        }
        
        return array_map(function($texture) {
            return asset('storage/textures/' . $texture);
        }, $this->texture_files);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function digitalOrders()
    {
        return $this->belongsToMany(DigitalOrder::class, 'digital_order_model', 'model_id', 'digital_order_id');
    }
}