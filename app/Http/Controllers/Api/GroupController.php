<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Group;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $groups = Group::whereHas('members', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->with(['members', 'owner', 'conversation'])->latest()->get();

        $groups->transform(function ($g) {
            $g->image_url = $g->imageUrl();
            $g->members->transform(function ($m) {
                $m->avatar_url = $m->avatarUrl();
                return $m;
            });
            return $g;
        });

        return response()->json($groups);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:100',
            'description'  => 'nullable|string|max:500',
            'image'        => 'nullable|image|max:2048',
            'member_ids'   => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $group = Group::create([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'owner_id'    => $request->user()->id,
            'invite_code' => Str::random(10),
        ]);

        if ($request->hasFile('image')) {
            try {
                $cloudinary = new CloudinaryService();
                $result = $cloudinary->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder'         => 'whispr/groups',
                        'public_id'      => 'group_' . $group->id,
                        'overwrite'      => true,
                        'transformation' => ['width' => 200, 'height' => 200, 'crop' => 'fill'],
                    ]
                );
                $group->update(['image' => $result['url']]);
            } catch (\Exception $e) {
                $path = $request->file('image')->store('groups', 'public');
                $group->update(['image' => '/storage/' . $path]);
            }
        }

        $conversation = Conversation::create([
            'type'     => 'group',
            'group_id' => $group->id,
        ]);

        $members = array_unique(array_merge(
            [$request->user()->id],
            $data['member_ids'] ?? []
        ));

        foreach ($members as $userId) {
            $conversation->members()->attach($userId);
            \DB::table('group_members')->insert([
                'group_id'   => $group->id,
                'user_id'    => $userId,
                'role'       => $userId === $request->user()->id ? 'owner' : 'member',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $group->load(['members', 'conversation']);
        $group->image_url = $group->imageUrl();

        return response()->json($group, 201);
    }

    public function show(Request $request, Group $group)
    {
        $isMember = $group->members()->where('user_id', $request->user()->id)->exists();
        if (!$isMember) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $group->load(['members', 'owner', 'conversation']);
        $group->image_url = $group->imageUrl();
        $group->members->transform(function ($m) {
            $m->avatar_url = $m->avatarUrl();
            $m->role = $m->pivot->role ?? 'member';
            return $m;
        });

        return response()->json($group);
    }

    public function update(Request $request, Group $group)
    {
        $member = $group->members()->where('user_id', $request->user()->id)->first();
        $isAdmin = $member && in_array($member->pivot->role, ['owner', 'admin']);

        if (!$isAdmin && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Only group admins can edit'], 403);
        }

        $data = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'description' => 'sometimes|nullable|string|max:500',
            'image'       => 'sometimes|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            try {
                $cloudinary = new CloudinaryService();
                $result = $cloudinary->upload(
                    $request->file('image')->getRealPath(),
                    [
                        'folder'         => 'whispr/groups',
                        'public_id'      => 'group_' . $group->id,
                        'overwrite'      => true,
                        'transformation' => ['width' => 200, 'height' => 200, 'crop' => 'fill'],
                    ]
                );
                $data['image'] = $result['url'];
            } catch (\Exception $e) {
                $path = $request->file('image')->store('groups', 'public');
                $data['image'] = '/storage/' . $path;
            }
        }

        $group->update($data);
        $group->image_url = $group->imageUrl();

        return response()->json($group->fresh()->load('members'));
    }

    public function destroy(Request $request, Group $group)
    {
        if ($group->owner_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Only the owner can delete the group'], 403);
        }

        $group->delete();
        return response()->json(['message' => 'Group deleted']);
    }

    public function addMember(Request $request, Group $group)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $member = $group->members()->where('user_id', $request->user()->id)->first();
        $isAdmin = $member && in_array($member->pivot->role, ['owner', 'admin']);

        if (!$isAdmin) {
            return response()->json(['message' => 'Only admins can add members'], 403);
        }

        $conversation = $group->conversation;
        $conversation->members()->syncWithoutDetaching([$request->user_id]);

        \DB::table('group_members')->insert([
            'group_id'   => $group->id,
            'user_id'    => $request->user_id,
            'role'       => 'member',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Member added']);
    }

    public function removeMember(Request $request, Group $group, $userId)
    {
        $member = $group->members()->where('user_id', $request->user()->id)->first();
        $isAdmin = $member && in_array($member->pivot->role, ['owner', 'admin']);
        $isSelf = (int) $userId === $request->user()->id;

        if (!$isAdmin && !$isSelf) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($group->owner_id == $userId) {
            return response()->json(['message' => 'Cannot remove the group owner'], 403);
        }

        $conversation = $group->conversation;
        $conversation->members()->detach($userId);

        \DB::table('group_members')
            ->where('group_id', $group->id)
            ->where('user_id', $userId)
            ->delete();

        return response()->json(['message' => 'Member removed']);
    }

    public function promoteMember(Request $request, Group $group, $userId)
    {
        if ($group->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Only the owner can promote members'], 403);
        }

        \DB::table('group_members')
            ->where('group_id', $group->id)
            ->where('user_id', $userId)
            ->update(['role' => 'admin']);

        return response()->json(['message' => 'Member promoted to admin']);
    }

    public function leaveGroup(Request $request, Group $group)
    {
        if ($group->owner_id === $request->user()->id) {
            return response()->json(['message' => 'Owner must transfer ownership or delete the group'], 403);
        }

        $conversation = $group->conversation;
        $conversation->members()->detach($request->user()->id);

        \DB::table('group_members')
            ->where('group_id', $group->id)
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Left the group']);
    }
}
