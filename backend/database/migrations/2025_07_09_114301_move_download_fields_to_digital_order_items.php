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
        // Проверяем, существует ли колонка download_count
        if (!Schema::hasColumn('digital_order_items', 'download_count')) {
            Schema::table('digital_order_items', function (Blueprint $table) {
                $table->unsignedInteger('download_count')->default(0);
            });
        }

        // Проверяем, существует ли колонка downloaded_at
        if (!Schema::hasColumn('digital_order_items', 'downloaded_at')) {
            Schema::table('digital_order_items', function (Blueprint $table) {
                $table->timestamp('downloaded_at')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Не удаляем колонки, так как они могут быть созданы другими миграциями
    }
};