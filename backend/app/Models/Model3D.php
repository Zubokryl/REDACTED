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
        'license',
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
    ];

 
    protected $casts = [
        'formats' => 'array',
        'features' => 'array',
        'tools' => 'array',
        'tags' => 'array',
        'materials' => 'array',
        'images' => 'array',
        'printable' => 'boolean',
        'customizable' => 'boolean',
        'release_date' => 'date',
        'price' => 'float',
    ];

    protected $appends = ['model_file_url', 'preview_image_url']; 

    public function getModelFileUrlAttribute()
    {
        return $this->model_file ? asset('storage/' . $this->model_file) : null;
    }

    public function getPreviewImageUrlAttribute()
{
    return $this->preview_image ? asset('storage/previews/' . $this->preview_image) : null;
}

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }
}