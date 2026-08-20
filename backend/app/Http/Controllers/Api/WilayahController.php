<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class WilayahController extends Controller
{
    private string $base = 'https://wilayah.id/api';

    public function provinces(): JsonResponse
    {
        $res = Http::get("{$this->base}/provinces.json");
        return response()->json($res->json());
    }

    public function regencies(string $code): JsonResponse
    {
        $res = Http::get("{$this->base}/regencies/{$code}.json");
        return response()->json($res->json());
    }

    public function districts(string $code): JsonResponse
    {
        $res = Http::get("{$this->base}/districts/{$code}.json");
        return response()->json($res->json());
    }

    public function villages(string $code): JsonResponse
    {
        $res = Http::get("{$this->base}/villages/{$code}.json");
        return response()->json($res->json());
    }
}
