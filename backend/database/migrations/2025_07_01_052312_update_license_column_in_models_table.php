<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn('license'); 
            $table->json('available_licenses')->nullable(); 
        });
    }

    public function down()
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn('available_licenses'); 
            $table->string('license')->default('Standard License'); 
        });
    }
};