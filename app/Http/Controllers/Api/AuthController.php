<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'                  => 'required|string|max:255',
            'username'              => 'required|string|max:30|unique:users|alpha_dash',
            'email'                 => 'required|string|email|max:255|unique:users',
            'password'              => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user'  => array_merge($user->toArray(), [
                'avatar_url' => $user->avatarUrl(),
            ]),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if ($user->is_banned) {
            return response()->json(['message' => 'Your account has been suspended'], 403);
        }

        $user->update([
            'is_online'    => true,
            'last_seen_at' => now(),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user'  => array_merge($user->toArray(), [
                'avatar_url' => $user->avatarUrl(),
            ]),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->update([
            'is_online'    => false,
            'last_seen_at' => now(),
        ]);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
    $user = $request->user();
    $user->update([
        'is_online'    => true,
        'last_seen_at' => now(),
    ]);
    return response()->json(array_merge($user->fresh()->toArray(), [
        'avatar_url' => $user->avatarUrl(),
    ]));
    }
}