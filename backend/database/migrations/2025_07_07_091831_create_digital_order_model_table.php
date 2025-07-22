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
      Schema::create('digital_order_model', function (Blueprint $table) {
    $table->foreignId('digital_order_id')->constrained()->onDelete('cascade');
    $table->foreignId('model_id')->constrained('models')->onDelete('cascade');
    $table->primary(['digital_order_id', 'model_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_order_model');
    }
};
