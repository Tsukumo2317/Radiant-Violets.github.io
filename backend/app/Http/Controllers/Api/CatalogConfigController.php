<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CatalogConfigController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'categories' => [
                    ['id' => 'engagement', 'label' => 'Помолвочные кольца'],
                    ['id' => 'rings', 'label' => 'Кольца'],
                    ['id' => 'necklaces', 'label' => 'Ожерелья'],
                    ['id' => 'bracelets', 'label' => 'Браслеты'],
                    ['id' => 'earrings', 'label' => 'Серьги'],
                ],
                'cuts' => [
                    ['id' => 'round', 'label' => 'Круглая'],
                    ['id' => 'princess', 'label' => 'Принцесса'],
                    ['id' => 'emerald', 'label' => 'Изумруд'],
                    ['id' => 'oval', 'label' => 'Овальная'],
                    ['id' => 'pear', 'label' => 'Груша'],
                    ['id' => 'heart', 'label' => 'Сердце'],
                    ['id' => 'cushion', 'label' => 'Подушка'],
                ],
                'sizes' => [16, 16.5, 17, 17.5, 18],
                'priceMax' => 200000,
            ],
        ]);
    }
}
