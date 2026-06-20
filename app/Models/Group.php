<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'image',
        'owner_id', 'is_public', 'invite_code',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'group_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function conversation()
    {
        return $this->hasOne(Conversation::class);
    }

    public function imageUrl(): string
    {
        return $this->image
            ? asset('storage/' . $this->image)
            : 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=6366f1&color=fff';
    }
}