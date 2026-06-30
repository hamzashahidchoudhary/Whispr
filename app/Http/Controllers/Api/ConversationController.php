<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\ConversationMember;
use App\Models\Message;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $conversations = Conversation::whereHas('members', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })
        ->with(['members', 'group', 'lastMessage.sender'])
        ->withCount(['messages as unread_count' => function ($q) use ($request) {
            $q->where('sender_id', '!=', $request->user()->id)
              ->whereNull('read_at');
        }])
        ->latest('updated_at')
        ->paginate(30);

        $conversations->getCollection()->transform(function ($conv) {
            $conv->members->transform(function ($member) {
                $member->avatar_url = $member->avatarUrl();
                return $member;
            });
            if ($conv->group) {
                $conv->group->image_url = $conv->group->imageUrl();
            }
            return $conv;
        });

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $me      = $request->user()->id;
        $otherId = $request->user_id;

        if ($me === $otherId) {
            return response()->json(['message' => 'Cannot start conversation with yourself'], 422);
        }

        $existing = Conversation::where('type', 'private')
            ->whereHas('members', fn($q) => $q->where('user_id', $me))
            ->whereHas('members', fn($q) => $q->where('user_id', $otherId))
            ->first();

        if ($existing) {
            return response()->json($existing->load(['members', 'lastMessage']));
        }

        $conversation = Conversation::create(['type' => 'private']);
        $conversation->members()->attach([$me, $otherId]);

        return response()->json($conversation->load('members'), 201);
    }

    public function show(Request $request, Conversation $conversation)
    {
        $isMember = $conversation->members()->where('user_id', $request->user()->id)->exists();
        if (!$isMember) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $conversation->load(['members', 'group', 'lastMessage.sender']);
        $conversation->members->transform(function ($member) {
            $member->avatar_url = $member->avatarUrl();
            return $member;
        });
        if ($conversation->group) {
            $conversation->group->image_url = $conversation->group->imageUrl();
        }

        return response()->json($conversation);
    }

    public function markRead(Request $request, Conversation $conversation)
    {
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
