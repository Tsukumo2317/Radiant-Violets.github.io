<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query()->orderBy('id');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->string('category_id'));
        }

        if ($request->filled('q')) {
            $q = '%'.$request->string('q').'%';
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', $q)->orWhere('sku', 'like', $q);
            });
        }

        return response()->json([
            'data' => $query->get()->map(fn (Product $p) => $this->toCatalogShape($p)),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::query()->find($id);
        if (! $product) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json(['data' => $this->toCatalogShape($product)]);
    }

    /**
     * @return array<string, mixed>
     */
    private function toCatalogShape(Product $p): array
    {
        return [
            'id' => $p->id,
            'name' => $p->name,
            'currentPrice' => $p->current_price,
            'oldPrice' => $p->old_price,
            'imageUrl' => $p->image_url,
            'categoryId' => $p->category_id,
            'cutId' => $p->cut_id,
            'size' => (float) $p->size,
            'metals' => $p->metals ?? [],
            'stock' => $p->stock,
            'sku' => $p->sku,
            'description' => $p->description ?? '',
            'mediaImages' => $p->media_images ?? [],
            'mediaVideos' => $p->media_videos ?? [],
        ];
    }
}
