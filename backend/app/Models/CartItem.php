<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'model_id', 'license_type'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function model()
    {
        return $this->belongsTo(Model3D::class, 'model_id');
    }
}