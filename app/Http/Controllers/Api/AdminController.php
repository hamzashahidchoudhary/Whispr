<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Conversation;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_users'    => User::count(),
            'online_users'   => User::where('is_online', true)->count(),
            'messages_today' => Message::whereDate('created_at', today())->count(),
            'total_groups'   => Group::count(),
            'files_uploaded' => Attachment::count(),
            'banned_users'   => User::where('is_banned', true)->count(),
        ]);
    }

    public function users(Request $request)
    {
        $users = User::when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%");
            })
            ->latest()
            ->paginate(20);

        $users->getCollection()->transform(function ($user) {
            $user->avatar_url = $user->avatarUrl();
            return $user;
        });

        return response()->json($users);
    }

    public function ban(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot ban an admin'], 403);
        }

        $user->update([
            'is_banned' => true,
            'banned_at' => now(),
        ]);

        $user->tokens()->delete();

        return response()->json(['message' => 'User banned successfully']);
    }

    public function unban($userId)
    {
        $user = User::findOrFail($userId);

        $user->update([
            'is_banned' => false,
            'banned_at' => null,
        ]);

        return response()->json(['message' => 'User unbanned successfully']);
    }

    public function deleteUser($userId)
    {
        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot delete an admin'], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function deleteMessage($messageId)
    {
        $message = Message::findOrFail($messageId);
        $message->update(['is_deleted' => true, 'body' => null]);

        return response()->json(['message' => 'Message deleted successfully']);
    }
}