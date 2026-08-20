<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'default_address' => ['nullable', 'array'],
        ]);

        $user = $request->user();

        $fill = collect($validated)->except('default_address')->toArray();
        $user->update($fill);

        if (!empty($validated['default_address'])) {
            $user->default_address = $validated['default_address'];
            $user->address = $validated['default_address']['address'] ?? $user->address;
            $user->city = $validated['default_address']['city'] ?? $user->city;
            $user->province = $validated['default_address']['province'] ?? $user->province;
            $user->postal_code = $validated['default_address']['postal_code'] ?? $user->postal_code;
            $user->save();
        }

        return response()->json([
            'message' => 'Profile updated',
            'user' => $user->fresh(),
        ]);
    }
}
