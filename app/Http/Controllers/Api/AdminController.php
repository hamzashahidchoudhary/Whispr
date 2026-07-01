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
        $sevenDaysAgo = now()->subDays(7);

        // Messages per day for the last 7 days (for chart)
        $messagesPerDay = Message::where('created_at', '>=', $sevenDaysAgo)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'total_users'      => User::count(),
            'online_users'     => User::where('is_online', true)->count(),
            'banned_users'     => User::where('is_banned', true)->count(),
            'new_users_today'  => User::whereDate('created_at', today())->count(),
            'total_messages'   => Message::count(),
            'messages_today'   => Message::whereDate('created_at', today())->count(),
            'total_groups'     => Group::count(),
            'total_conversations' => Conversation::count(),
            'files_uploaded'   => Attachment::count(),
            'storage_used_mb'  => round(Attachment::sum('size') / 1024 / 1024, 2),
            'messages_per_day' => $messagesPerDay,
        ]);
    }

    public function users(Request $request)
    {
        $users = User::when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('username', 'like', "%{$request->search}%");
            })
            ->when($request->filter === 'banned', fn($q) => $q->where('is_banned', true))
            ->when($request->filter === 'online', fn($q) => $q->where('is_online', true))
            ->when($request->filter === 'admins', fn($q) => $q->where('role', 'admin'))
            ->withCount('messages')
            ->latest()
            ->paginate(20);

        $users->getCollection()->transform(function ($user) {
            $user->avatar_url = $user->avatarUrl();
            return $user;
        });

        return response()->json($users);
    }

    public function showUser(Request $request, $userId)
    {
        $user = User::withCount('messages')->findOrFail($userId);
        $user->avatar_url = $user->avatarUrl();
        $user->conversations_count = $user->conversations()->count();

        return response()->json($user);
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

    public function makeAdmin(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['role' => 'admin']);

        return response()->json(['message' => 'User promoted to admin']);
    }

    public function removeAdmin(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if ((int) $userId === $request->user()->id) {
            return response()->json(['message' => 'Cannot remove your own admin status'], 403);
        }

        $user->update(['role' => 'user']);

        return response()->json(['message' => 'Admin status removed']);
    }

    public function deleteUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Cannot delete an admin'], 403);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function messages(Request $request)
    {
        $messages = Message::when($request->search, function ($q) use ($request) {
                $q->where('body', 'like', "%{$request->search}%");
            })
            ->with(['sender', 'conversation'])
            ->where('is_deleted', false)
            ->latest()
            ->paginate(30);

        $messages->getCollection()->transform(function ($msg) {
            if ($msg->sender) $msg->sender->avatar_url = $msg->sender->avatarUrl();
            return $msg;
        });

        return response()->json($messages);
    }

    public function deleteMessage($messageId)
    {
        $message = Message::findOrFail($messageId);
        $message->update(['is_deleted' => true, 'body' => null]);

        return response()->json(['message' => 'Message deleted successfully']);
    }

    public function groups(Request $request)
    {
        $groups = Group::when($request->search, function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%");
            })
            ->withCount('members')
            ->with('owner')
            ->latest()
            ->paginate(20);

        $groups->getCollection()->transform(function ($g) {
            $g->image_url = $g->imageUrl();
            return $g;
        });

        return response()->json($groups);
    }

    public function deleteGroup($groupId)
    {
        $group = Group::findOrFail($groupId);
        $group->delete();

        return response()->json(['message' => 'Group deleted successfully']);
    }
}
