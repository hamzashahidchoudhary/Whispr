<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id', 'sender_id', 'reply_to_id',
        'body', 'type', 'is_edited', 'is_deleted',
        'is_pinned', 'delivered_at', 'read_at', 'expires_at',
    ];

    protected $casts = [
        'is_edited'    => 'boolean',
        'is_deleted'   => 'boolean',
        'is_pinned'    => 'boolean',
        'delivered_at' => 'datetime',
        'read_at'      => 'datetime',
        'expires_at'   => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function replyTo()
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }

    public function reactions()
    {
        return $this->hasMany(MessageReaction::class);
    }

    public function getBodyAttribute($value)
    {
        return $this->is_deleted ? null : $value;
    }
}