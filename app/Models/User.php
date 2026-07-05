<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Carbon\Carbon;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'username', 'email', 'password',
        'avatar', 'avatar_public_id', 'role', 'status', 'bio',
        'is_online', 'last_seen_at', 'is_banned', 'banned_at',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $appends = ['is_online_status'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_seen_at'      => 'datetime',
            'password'          => 'hashed',
            'is_banned'         => 'boolean',
        ];
    }

    // Dynamic online status based on last_seen_at
    public function getIsOnlineAttribute(): bool
    {
        if (!$this->last_seen_at) return false;
        return Carbon::parse($this->last_seen_at)->gt(now()->subMinutes(2));
    }

    public function getIsOnlineStatusAttribute(): bool
    {
        return $this->is_online;
    }

    public function avatarUrl(): string
    {
        if ($this->avatar) {
            if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
                return $this->avatar;
            }
            return asset('storage/' . $this->avatar);
        }
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=6366f1&color=fff&size=128';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_members');
    }
}
