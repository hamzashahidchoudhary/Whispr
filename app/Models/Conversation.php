<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type', 'group_id', 'last_message_id', 'pinned_message_id',
        ];

    public function members()
    {
        return $this->belongsToMany(User::class, 'conversation_members')
            ->withPivot(['last_read_at', 'is_archived', 'is_pinned'])
            ->withTimestamps();
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function lastMessage()
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function conversationMembers()
    {
        return $this->hasMany(ConversationMember::class);
    }
}