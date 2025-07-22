<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
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

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_order_items');
    }
};
