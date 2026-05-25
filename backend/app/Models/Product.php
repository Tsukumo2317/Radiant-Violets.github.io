<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name',
        'current_price',
        'old_price',
        'image_url',
        'category_id',
        'cut_id',
        'size',
        'metals',
        'stock',
        'sku',
        'description',
        'media_images',
        'media_videos',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metals' => 'array',
            'media_images' => 'array',
            'media_videos' => 'array',
            'size' => 'decimal:1',
        ];
    }
}
