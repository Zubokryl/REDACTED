<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePaymentsTable extends Migration
{
    public function up(): void
    {
      Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->foreignId('digital_order_id')->constrained('digital_orders')->onDelete('cascade');

    $table->string('intent_id')->unique();
    $table->string('client_secret');
    $table->integer('amount');
    $table->string('currency', 3);
    $table->string('status')->default('created');

    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
}