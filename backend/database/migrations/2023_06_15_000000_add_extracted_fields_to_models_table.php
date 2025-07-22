<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddExtractedFieldsToModelsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('models', function (Blueprint $table) {
            $table->string('extracted_model_file')->nullable();
            $table->string('extracted_tbscene_file')->nullable();
            $table->json('texture_files')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn('extracted_model_file');
            $table->dropColumn('extracted_tbscene_file');
            $table->dropColumn('texture_files');
        });
    }
}