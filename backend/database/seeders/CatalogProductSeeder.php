<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

/**
 * Те же 10 товаров, что в Js/products-data.js (BASE_CATALOG_PRODUCTS).
 */
class CatalogProductSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'id' => 1,
                'name' => 'Золотое кольцо с бриллиантом выращенным',
                'current_price' => 43000,
                'old_price' => 50000,
                'image_url' => './Товары/Кольца/SMART DIAMONDS (Принцесса)/1.jpg',
                'category_id' => 'rings',
                'cut_id' => 'princess',
                'size' => 17,
                'metals' => json_encode(['gold', 'white']),
                'stock' => 3,
                'sku' => 'RV-RG-001',
                'description' => 'Кольцо с выращенным бриллиантом в аккуратной оправе. Модель рассчитана на повседневную носку и торжественные случаи.',
            ],
            [
                'id' => 2,
                'name' => 'Золотое кольцо с гранатом',
                'current_price' => 20990,
                'old_price' => 25000,
                'image_url' => './Товары/Кольца/Золотое кольцо с гранатом (Овал)/1.jpg',
                'category_id' => 'rings',
                'cut_id' => 'oval',
                'size' => 16.5,
                'metals' => json_encode(['gold']),
                'stock' => 5,
                'sku' => 'RV-RG-002',
                'description' => 'Золотое кольцо с выразительным гранатом. Лаконичный дизайн и теплый оттенок металла подчеркивают камень.',
            ],
            [
                'id' => 3,
                'name' => 'Серебряный браслет с аметистами и фианитами',
                'current_price' => 5700,
                'old_price' => 8000,
                'image_url' => './Товары/Браслеты/Серебряный браслет (Груша)/1.jpg',
                'category_id' => 'bracelets',
                'cut_id' => 'pear',
                'size' => 18,
                'metals' => json_encode(['silver']),
                'stock' => 4,
                'sku' => 'RV-BR-001',
                'description' => 'Легкий серебряный браслет с фианитами и акцентными аметистами. Подходит для ежедневного образа.',
            ],
            [
                'id' => 4,
                'name' => 'Золотой браслет с гранатом и фианитами',
                'current_price' => 49000,
                'old_price' => 75000,
                'image_url' => './Товары/Браслеты/Золотой браслет с гранатом и фианитами (Круг)/1.jpg',
                'category_id' => 'bracelets',
                'cut_id' => 'round',
                'size' => 17.5,
                'metals' => json_encode(['gold', 'white']),
                'stock' => 2,
                'sku' => 'RV-BR-002',
                'description' => 'Статусный браслет в золоте с гранатом. Контраст оттенков делает украшение заметным в любом образе.',
            ],
            [
                'id' => 5,
                'name' => 'Золотая подвеска с ситаллом и фианитами',
                'current_price' => 13200,
                'old_price' => 15000,
                'image_url' => './Товары/Ожирелья/Золотая подвеска с ситаллом и фианитами (Изумруд)/1.jpg',
                'category_id' => 'necklaces',
                'cut_id' => 'emerald',
                'size' => 16,
                'metals' => json_encode(['gold']),
                'stock' => 7,
                'sku' => 'RV-NK-001',
                'description' => 'Подвеска с ситаллом изумрудной формы и дорожкой фианитов. Изящное украшение с мягким блеском.',
            ],
            [
                'id' => 6,
                'name' => 'Золотая подвеска с фианитами',
                'current_price' => 19000,
                'old_price' => 25000,
                'image_url' => './Товары/Ожирелья/Золотая подвеска с фианитами (Круг)/1.jpg',
                'category_id' => 'necklaces',
                'cut_id' => 'round',
                'size' => 17,
                'metals' => json_encode(['gold', 'white']),
                'stock' => 6,
                'sku' => 'RV-NK-002',
                'description' => 'Классическая подвеска с фианитами в круглой форме огранки. Универсальный вариант для подарка.',
            ],
            [
                'id' => 7,
                'name' => 'Золотые серьги с топазами Sky и фианитами',
                'current_price' => 12000,
                'old_price' => 13000,
                'image_url' => './Товары/Серьги/Золотые серьги с топазами Sky и фианитами (Сердце)/1.jpg',
                'category_id' => 'earrings',
                'cut_id' => 'heart',
                'size' => 16,
                'metals' => json_encode(['gold']),
                'stock' => 8,
                'sku' => 'RV-ER-001',
                'description' => 'Серьги с топазами формы сердце и фианитами. Комфортная посадка и деликатный блеск.',
            ],
            [
                'id' => 8,
                'name' => 'Серебряные серьги с имитацией кварца и фианитами',
                'current_price' => 2500,
                'old_price' => 3000,
                'image_url' => './Товары/Серьги/Серебряные серьги с имитацией кварца и фианитами (Подушка)/1.jpg',
                'category_id' => 'earrings',
                'cut_id' => 'cushion',
                'size' => 16.5,
                'metals' => json_encode(['silver', 'white']),
                'stock' => 10,
                'sku' => 'RV-ER-002',
                'description' => 'Серебряные серьги с имитацией кварца формы подушка. Лаконичная пара на каждый день.',
            ],
            [
                'id' => 9,
                'name' => 'Золотое кольцо с бриллиантами',
                'current_price' => 24000,
                'old_price' => 26000,
                'image_url' => './Товары/Помолвочные кольца/Золотое кольцо с бриллиантами (Круглая)/1.jpg',
                'category_id' => 'engagement',
                'cut_id' => 'round',
                'size' => 17,
                'metals' => json_encode(['gold', 'white']),
                'stock' => 3,
                'sku' => 'RV-EN-001',
                'description' => 'Помолвочное кольцо с бриллиантами в классической круглой огранке. Выверенные пропорции и сияние.',
            ],
            [
                'id' => 10,
                'name' => 'Золотое кольцо с бриллиантами выращенными',
                'current_price' => 30300,
                'old_price' => 35000,
                'image_url' => './Товары/Помолвочные кольца/Золотое кольцо с бриллиантами выращенными (Принцесса)/1.jpg',
                'category_id' => 'engagement',
                'cut_id' => 'princess',
                'size' => 16.5,
                'metals' => json_encode(['gold']),
                'stock' => 4,
                'sku' => 'RV-EN-002',
                'description' => 'Помолвочное кольцо с выращенными бриллиантами огранки принцесса. Элегантная геометрия и чистый свет.',
            ],
        ];

        $now = now();

        foreach ($rows as &$row) {
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
            $row['media_images'] = null;
            $row['media_videos'] = null;
        }
        unset($row);

        Product::query()->upsert($rows, ['id'], [
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
            'updated_at',
        ]);
    }
}
