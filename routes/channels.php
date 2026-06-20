<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return \App\Models\ConversationMember::where('conversation_id', $conversationId)
        ->where('user_id', $user->id)
        ->exists() ? [
            'id'         => $user->id,
            'name'       => $user->name,
            'avatar_url' => $user->avatarUrl(),
        ] : false;
});