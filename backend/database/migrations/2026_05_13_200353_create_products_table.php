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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('current_price');
            $table->unsignedInteger('old_price')->default(0);
            $table->text('image_url');
            $table->string('category_id', 32);
            $table->string('cut_id', 32);
            $table->decimal('size', 4, 1)->nullable();
            $table->json('metals');
            $table->unsignedSmallInteger('stock')->default(0);
            $table->string('sku', 64)->unique();
            $table->text('description')->nullable();
            $table->json('media_images')->nullable();
            $table->json('media_videos')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
