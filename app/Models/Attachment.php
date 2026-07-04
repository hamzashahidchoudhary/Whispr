<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $fillable = [
        'message_id', 'path', 'name', 'mime_type', 'size', 'cloudinary_id',
    ];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    // Return the correct URL whether Cloudinary or local
    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }
        return asset('storage/' . $this->path);
    }
}
