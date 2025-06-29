<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPreviewImageToModelsTable extends Migration
{
    public function up()
    {
        Schema::table('models', function (Blueprint $table) {
            $table->string('preview_image')->nullable();
        });
    }

    public function down()
    {
        Schema::table('models', function (Blueprint $table) {
            $table->dropColumn('preview_image');
        });
    }
}