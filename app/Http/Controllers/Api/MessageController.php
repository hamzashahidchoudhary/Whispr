<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        $isMember = $conversation->members()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->with(['sender', 'attachments', 'reactions.user', 'replyTo.sender'])
            ->latest()
            ->paginate(50);

        $messages->getCollection()->transform(function ($message) {
            $message->sender->avatar_url = $message->sender->avatarUrl();
            return $message;
        });

        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('delivered_at')
            ->update(['delivered_at' => now()]);

        return response()->json($messages);
    }

    public function store(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);

        $isMember = $conversation->members()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate([
            'body'          => 'required_without:attachments|nullable|string|max:5000',
            'type'          => 'sometimes|in:text,image,video,audio,file',
            'reply_to_id'   => 'sometimes|nullable|exists:messages,id',
            'attachments'   => 'sometimes|array|max:5',
            'attachments.*' => 'file|max:51200',
        ]);

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id'       => $request->user()->id,
            'body'            => $request->body,
            'type'            => $request->input('type', 'text'),
            'reply_to_id'     => $request->reply_to_id,
        ]);

        if ($request->hasFile('attachments')) {
            $cloudinary = new CloudinaryService();

            foreach ($request->file('attachments') as $file) {
                $isImage = str_starts_with($file->getMimeType(), 'image/');
                $isVideo = str_starts_with($file->getMimeType(), 'video/');

                $resourceType = $isVideo ? 'video' : ($isImage ? 'image' : 'raw');

                $options = [
                    'folder'        => 'whispr/attachments',
                    'resource_type' => $resourceType,
                ];

                if ($isImage) {
                    $options['transformation'] = [
                        'quality' => 'auto',
                        'fetch_format' => 'auto',
                    ];
                }

                try {
                    $result = $cloudinary->upload($file->getRealPath(), $options);
                    $url = $result['url'];
                    $publicId = $result['public_id'];
                } catch (\Exception $e) {
                    // Fallback to local storage
                    $path = $file->store('attachments', 'public');
                    $url = '/storage/' . $path;
                    $publicId = null;
                }

                $message->attachments()->create([
                    'path'             => $url,
                    'name'             => $file->getClientOriginalName(),
                    'mime_type'        => $file->getMimeType(),
                    'size'             => $file->getSize(),
                    'cloudinary_id'    => $publicId,
                ]);
            }
        }

        $conversation->update(['last_message_id' => $message->id]);

        $message->load(['sender', 'attachments', 'replyTo.sender']);
        $message->sender->avatar_url = $message->sender->avatarUrl();

        // Broadcasting disabled - using polling instead
        return response()->json($message, 201);
    }

    public function update(Request $request, Message $message)
    {
        if ($message->sender_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $request->validate(['body' => 'required|string|max:5000']);

        $message->update([
            'body'      => $request->body,
            'is_edited' => true,
        ]);

        return response()->json($message);
    }

    public function destroy(Request $request, Message $message)
    {
        if ($message->sender_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $message->update(['is_deleted' => true, 'body' => null]);

        return response()->json(['message' => 'Message deleted']);
    }

    public function react(Request $request, Message $message)
    {
        $request->validate(['emoji' => 'required|string|max:10']);

        $userId = $request->user()->id;

        $existing = MessageReaction::where([
            'message_id' => $message->id,
            'user_id'    => $userId,
            'emoji'      => $request->emoji,
        ])->first();

        if ($existing) {
            $existing->delete();
        } else {
            MessageReaction::where([
                'message_id' => $message->id,
                'user_id'    => $userId,
            ])->delete();

            MessageReaction::create([
                'message_id' => $message->id,
                'user_id'    => $userId,
                'emoji'      => $request->emoji,
            ]);
        }

        return response()->json([
            'reactions' => $message->reactions()->with('user')->get(),
        ]);
    }

    public function pin(Request $request, Message $message)
    {
        $conversation = Conversation::findOrFail($message->conversation_id);

        $isMember = $conversation->members()
            ->where('user_id', $request->user()->id)
            ->exists();

        if (!$isMember) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($conversation->pinned_message_id === $message->id) {
            $conversation->update(['pinned_message_id' => null]);
            return response()->json(['message' => 'Message unpinned', 'pinned' => false]);
        }

        $conversation->update(['pinned_message_id' => $message->id]);
        return response()->json(['message' => 'Message pinned', 'pinned' => true]);
    }
}
