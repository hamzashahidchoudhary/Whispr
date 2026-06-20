<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $groups = Group::whereHas('members', function ($q) use ($request) {
            $q->where('user_id', $request->user()->id);
        })->with(['members', 'owner'])->latest()->get();

        return response()->json($groups);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'image'       => 'nullable|image|max:2048',
            'member_ids'  => 'nullable|array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $group = Group::create([
            'name'        => $data['name'],
            'description' => $data['description'] ?? null,
            'owner_id'    => $request->user()->id,
            'invite_code' => Str::random(10),
        ]);

        if ($request->hasFile('image')) {
            $group->update([
                'image' => $request->file('image')->store('groups', 'public'),
            ]);
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
        }

        return response()->json($group->load(['members', 'conversation']), 201);
    }

    public function show(Group $group)
    {
        return response()->json($group->load(['members', 'owner', 'conversation']));
    }

    public function update(Request $request, Group $group)
    {
        if ($group->owner_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'name'        => 'sometimes|string|max:100',
            'description' => 'sometimes|nullable|string|max:500',
            'image'       => 'sometimes|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('groups', 'public');
        }

        $group->update($data);

        return response()->json($group->fresh());
    }

    public function destroy(Request $request, Group $group)
    {
        if ($group->owner_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $group->delete();

        return response()->json(['message' => 'Group deleted']);
    }

    public function addMember(Request $request, Group $group)
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $conversation = $group->conversation;
        $conversation->members()->syncWithoutDetaching([$request->user_id]);

        return response()->json(['message' => 'Member added']);
    }

    public function removeMember(Request $request, Group $group, $userId)
    {
        if ($group->owner_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $conversation = $group->conversation;
        $conversation->members()->detach($userId);

        return response()->json(['message' => 'Member removed']);
    }
}
