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
    Schema::table('users', function (Blueprint $table) {
        $table->text('about')->nullable()->change();
        $table->text('experience')->nullable()->change();
        $table->text('skills')->nullable()->change();
        $table->json('software')->nullable()->change();
        $table->json('social_links')->nullable()->change();
    });
}

    /**
     * Reverse the migrations.
     */
   public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->string('about', 255)->nullable()->change();
        $table->string('experience', 255)->nullable()->change();
        $table->string('skills', 255)->nullable()->change();
        $table->string('software', 255)->nullable()->change();
        $table->string('social_links', 255)->nullable()->change();
    });
}
};
