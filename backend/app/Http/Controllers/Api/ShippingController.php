<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class ShippingController extends Controller
{
    public function rates(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'destination_area_id' => 'required|string',
            'destination_postal_code' => 'required|string',
            'weight' => 'required|numeric',
            'couriers' => 'required|string',
        ]);

        $apiKey = config('services.biteship.api_key');
        $originAreaId = config('services.biteship.origin_area_id');

        if (!$apiKey || $apiKey === 'your-biteship-api-key') {
            return response()->json([
                'error' => true,
                'message' => 'Biteship API key not configured',
                'pricing' => [],
            ]);
        }

        if (!$originAreaId) {
            return response()->json([
                'error' => true,
                'message' => 'Origin area ID not configured',
                'pricing' => [],
            ]);
        }

        // Resolve Biteship area ID from postal code (cached for 24h)
        $postal = $validated['destination_postal_code'];
        $cacheKey = "biteship_area_{$postal}";
        $destAreaId = Cache::remember($cacheKey, now()->addDay(), function () use ($apiKey, $postal) {
            $resp = Http::timeout(10)->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
            ])->get(config('services.biteship.base_url') . '/v1/maps/areas', [
                'input' => $postal,
                'type' => 'single',
            ]);
            if ($resp->successful()) {
                $data = $resp->json();
                if (!empty($data['areas'][0]['id'])) {
                    return $data['areas'][0]['id'];
                }
            }
            return null;
        });

        if (!$destAreaId) {
            return response()->json([
                'error' => true,
                'message' => 'Could not resolve destination area for postal code ' . $postal,
                'pricing' => [],
            ]);
        }

        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
            ])->post(config('services.biteship.base_url') . '/v1/rates/couriers', [
                'origin_area_id' => $originAreaId,
                'destination_area_id' => $destAreaId,
                'couriers' => $validated['couriers'],
                'items' => [
                    [
                        'name' => 'Coffee products',
                        'value' => 100000,
                        'weight' => (int) $validated['weight'],
                        'quantity' => 1,
                    ],
                ],
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'error' => true,
                'message' => 'Biteship API error: ' . $response->status(),
                'pricing' => [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => true,
                'message' => 'Biteship API unavailable',
                'pricing' => [],
            ]);
        }
    }

    public function track(string $awb, string $courier): JsonResponse
    {
        $apiKey = config('services.biteship.api_key');

        if (!$apiKey || $apiKey === 'your-biteship-api-key') {
            return response()->json(['error' => true, 'message' => 'API key not configured']);
        }

        try {
            $response = Http::timeout(10)->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
            ])->get(config('services.biteship.base_url') . '/v1/trackings/' . $awb . '/couriers/' . $courier);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => true, 'message' => 'Tracking unavailable']);
        }
    }
}
