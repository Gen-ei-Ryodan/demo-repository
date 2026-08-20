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
        $query = Product::active()->with('category');

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $products = $query->paginate(12);

        return response()->json($products);
    }

    public function show(string $slug): JsonResponse
    {
        $product = Product::active()->with('category')->where('slug', $slug)->firstOrFail();

        return response()->json([
            'product' => $product,
        ]);
    }
}
