<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('digital_orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('price', 8, 2);
            $table->enum('license_type', ['personal', 'commercial', 'enterprise']);
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');

            $table->unsignedInteger('download_count')->default(0);
            $table->timestamp('downloaded_at')->nullable();

            $table->timestamps();

            $table->index(['user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_orders');
    }
};