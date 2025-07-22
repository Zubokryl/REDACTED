<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCartItemsTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('cart_items')) {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('model_id')->constrained('models')->onDelete('cascade');
            
            $table->enum('license_type', ['personal', 'commercial', 'enterprise']);
            
            $table->timestamps();
            
    
            $table->unique(['user_id', 'model_id']);
            $table->unique(['user_id', 'model_id', 'license_type']);
        });
        }
    }

    public function down()
    {
        Schema::dropIfExists('cart_items');
    }
}
