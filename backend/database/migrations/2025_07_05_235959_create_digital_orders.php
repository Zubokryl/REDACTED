<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Таблица заказов
        Schema::create('digital_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('price', 8, 2);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();

            $table->index(['user_id']);
        });

        // Привязка моделей к заказу (pivot)
        Schema::create('digital_order_model', function (Blueprint $table) {
            $table->foreignId('digital_order_id')->constrained()->onDelete('cascade');
            $table->foreignId('model_id')->constrained('models')->onDelete('cascade');
            $table->string('license_type')->default('standard');
            $table->primary(['digital_order_id', 'model_id']);
        });

        // Таблица элементов заказа
        Schema::create('digital_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('digital_order_id')->constrained('digital_orders')->onDelete('cascade');
            $table->foreignId('model_id')->constrained('models')->onDelete('cascade');
            $table->string('license_type');
            $table->decimal('price', 10, 2);
            $table->integer('download_count')->default(0);
            $table->timestamp('downloaded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_order_items');
        Schema::dropIfExists('digital_order_model');
        Schema::dropIfExists('digital_orders');
    }
};