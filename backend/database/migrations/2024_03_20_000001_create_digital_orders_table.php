<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('digital_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('model_id')->constrained('model3ds')->onDelete('cascade');
            $table->decimal('price', 10, 2);
            $table->string('license_type'); // personal, commercial, etc.
            $table->string('status')->default('pending'); // pending, completed, refunded
            $table->timestamp('downloaded_at')->nullable();
            $table->integer('download_count')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('digital_orders');
    }
}; 