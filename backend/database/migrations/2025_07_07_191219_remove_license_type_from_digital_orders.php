<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('digital_orders', function (Blueprint $table) {
            $table->dropColumn('license_type');
        });
    }

    public function down(): void
    {
        Schema::table('digital_orders', function (Blueprint $table) {
            $table->enum('license_type', ['personal', 'commercial', 'enterprise']);
        });
    }
};