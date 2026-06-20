<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('id', '!=', $request->user()->id)
            ->where('is_banned', false)
            ->select(['id', 'name', 'username', 'avatar', 'is_online', 'last_seen_at'])
            ->latest()
            ->paginate(20);

        $users->getCollection()->transform(function ($user) {
            $user->avatar_url = $user->avatarUrl();
            return $user;
        });

        return response()->json($users);
    }

    public function show(Request $request, $id)
    {
        $user = User::findOrFail($id);

        return response()->json(array_merge($user->toArray(), [
            'avatar_url' => $user->avatarUrl(),
        ]));
    }

    public function search(Request $request)
    {
        $q = $request->input('q', '');

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $users = User::where('id', '!=', $request->user()->id)
            ->where('is_banned', false)
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('username', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
            })
            ->select(['id', 'name', 'username', 'avatar', 'is_online'])
            ->limit(20)
            ->get()
            ->map(fn($u) => array_merge($u->toArray(), [
                'avatar_url' => $u->avatarUrl(),
            ]));

        return response()->json($users);
    }
}