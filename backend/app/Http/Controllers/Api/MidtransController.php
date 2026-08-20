<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MidtransController extends Controller
{
    public function callback(Request $request): JsonResponse
    {
        $order = Order::where('order_number', $request->order_id)->firstOrFail();

        $transactionStatus = $request->transaction_status;

        switch ($transactionStatus) {
            case 'settlement':
            case 'capture':
                $order->update([
                    'payment_status' => 'success',
                    'status' => 'paid',
                ]);
                break;
            case 'pending':
                $order->update([
                    'payment_status' => 'pending',
                ]);
                break;
            case 'deny':
            case 'cancel':
            case 'expire':
                $order->update([
                    'payment_status' => 'failed',
                ]);
                break;
            case 'refund':
                $order->update([
                    'status' => 'cancelled',
                ]);
                break;
        }

        return response()->json(['message' => 'OK'], 200);
    }
}
