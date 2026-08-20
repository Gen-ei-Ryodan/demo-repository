<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('user')->with('orderItems');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(15);

        return response()->json($orders);
    }

    public function show($id): JsonResponse
    {
        $order = Order::with('user')->with('orderItems.product')->findOrFail($id);

        return response()->json($order);
    }

    public function updateStatus(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,processing,shipped,delivered,cancelled',
            'shipping_awb' => 'nullable|string|max:100',
        ]);

        if ($validated['status'] === 'shipped' && empty(trim((string) ($validated['shipping_awb'] ?? '')))) {
            return response()->json(['message' => 'Tracking number is required when status is shipped.'], 422);
        }

        $order = Order::findOrFail($id);

        $update = ['status' => $validated['status']];
        if ($validated['status'] === 'shipped' && !empty($validated['shipping_awb'])) {
            $update['shipping_awb'] = trim($validated['shipping_awb']);
        }

        $order->update($update);

        return response()->json($order->load('user')->load('orderItems'));
    }
}

// Route: PUT /api/admin/orders/{id}/status
