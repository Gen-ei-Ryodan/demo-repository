<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()->orders()
            ->with('orderItems')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, string $orderNumber): JsonResponse
    {
        $order = $request->user()->orders()
            ->where('order_number', $orderNumber)
            ->with('orderItems.product')
            ->firstOrFail();

        return response()->json($order);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string',
            'shipping_address.phone' => 'required|string',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.province' => 'required|string',
            'shipping_address.postal_code' => 'required|string',
            'shipping_courier' => 'required|string',
            'shipping_service' => 'required|string',
            'shipping_cost' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $cart = $request->user()->cart()->with('cartItems.product')->first();

        if (!$cart || $cart->cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        $shippingAddress = $request->input('shipping_address', []);

        $user = $request->user();
        $user->default_address = $shippingAddress;
        $user->address = $shippingAddress['address'] ?? $user->address;
        $user->city = $shippingAddress['city'] ?? $user->city;
        $user->province = $shippingAddress['province'] ?? $user->province;
        $user->postal_code = $shippingAddress['postal_code'] ?? $user->postal_code;
        $user->save();

        $subtotal = $cart->cartItems->sum(function ($item) {
            return $item->product->price * $item->quantity;
        });

        $total = $subtotal + $validated['shipping_cost'];

        $orderNumber = 'ORD-' . strtoupper(uniqid());

        $order = $request->user()->orders()->create([
            'order_number' => $orderNumber,
            'status' => 'pending',
            'payment_status' => 'pending',
            'total' => $total,
            'shipping_cost' => $validated['shipping_cost'],
            'shipping_courier' => $validated['shipping_courier'],
            'shipping_service' => $validated['shipping_service'],
            'shipping_address' => $shippingAddress,
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($cart->cartItems as $cartItem) {
            $order->orderItems()->create([
                'product_id' => $cartItem->product_id,
                'name' => $cartItem->product->name,
                'price' => $cartItem->product->price,
                'quantity' => $cartItem->quantity,
                'subtotal' => $cartItem->product->price * $cartItem->quantity,
            ]);

            $cartItem->product->decrement('stock', $cartItem->quantity);
        }

        $cart->cartItems()->delete();

        \Midtrans\Config::$serverKey = config('services.midtrans.server_key');
        \Midtrans\Config::$isProduction = config('services.midtrans.is_production');

        $params = [
            'transaction_details' => [
                'order_id' => $order->order_number,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => [
                'first_name' => $request->user()->name,
                'email' => $request->user()->email,
                'phone' => $request->user()->phone,
            ],
        ];

        $snapToken = \Midtrans\Snap::getSnapToken($params);

        $order->update([
            'midtrans_snap_token' => $snapToken,
            'midtrans_order_id' => $order->order_number,
        ]);

        return response()->json([
            'order' => $order->fresh('orderItems'),
            'order_number' => $order->order_number,
            'midtrans_snap_token' => $snapToken,
        ], 201);
    }
}
