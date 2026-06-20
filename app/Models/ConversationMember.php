<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConversationMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id', 'user_id',
        'last_read_at', 'is_archived', 'is_pinned',
    ];

    protected $casts = [
        'last_read_at' => 'datetime',
        'is_archived'  => 'boolean',
        'is_pinned'    => 'boolean',
    ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}