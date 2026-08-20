<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cart->load('cartItems.product.category');

        return response()->json([
            'cart' => $cart,
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cartItem = $cart->cartItems()->where('product_id', $validated['product_id'])->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => $cartItem->quantity + $validated['quantity'],
            ]);
        } else {
            $cart->cartItems()->create([
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
            ]);
        }

        $cart->load('cartItems.product.category');

        return response()->json([
            'message' => 'Item added to cart',
            'cart' => $cart,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:0'],
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cartItem = $cart->cartItems()->findOrFail($id);

        if ($validated['quantity'] < 1) {
            $cartItem->delete();
        } else {
            $cartItem->update([
                'quantity' => $validated['quantity'],
            ]);
        }

        $cart->load('cartItems.product.category');

        return response()->json([
            'message' => 'Cart updated',
            'cart' => $cart,
        ]);
    }

    public function remove(Request $request, string $id): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cartItem = $cart->cartItems()->findOrFail($id);
        $cartItem->delete();

        $cart->load('cartItems.product.category');

        return response()->json([
            'message' => 'Item removed from cart',
            'cart' => $cart,
        ]);
    }

    public function clear(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        $cart->cartItems()->delete();

        return response()->json([
            'message' => 'Cart cleared',
        ]);
    }
}
