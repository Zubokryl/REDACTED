<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateModelsTable extends Migration
{
    public function up()
    {
        Schema::create('models', function (Blueprint $table) {
            $table->id();

            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('category')->nullable();

            $table->decimal('price', 8, 2)->default(0);
            $table->string('license')->default('Standard License');

            $table->json('formats')->nullable();
            $table->json('features')->nullable();
            $table->integer('vertices')->default(0);
            $table->boolean('printable')->default(false);

            $table->json('tools')->nullable();
            $table->json('tags')->nullable();
            $table->json('materials')->nullable();
            $table->boolean('customizable')->default(false);

            $table->date('release_date')->nullable();

            $table->string('model_file');
            $table->json('images')->nullable();
            $table->string('preview_video')->nullable();

            $table->timestamps();

            // Add indexes for better performance
            $table->index('creator_id');
            $table->index('category');
            $table->index('price');
        });
    }

    public function down()
    {
        Schema::dropIfExists('models');
    }
}