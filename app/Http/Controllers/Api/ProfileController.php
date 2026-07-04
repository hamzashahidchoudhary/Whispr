<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'name'     => 'sometimes|string|max:100',
            'username' => 'sometimes|string|max:50|unique:users,username,' . $request->user()->id,
            'status'   => 'sometimes|nullable|string|max:150',
            'bio'      => 'sometimes|nullable|string|max:500',
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'username', 'status', 'bio']));
        $user->avatar_url = $user->avatarUrl();

        return response()->json($user);
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = $request->user();
        $cloudinary = new CloudinaryService();

        // Delete old avatar from Cloudinary if exists
        if ($user->avatar_public_id) {
            try {
                $cloudinary->delete($user->avatar_public_id);
            } catch (\Exception $e) {
                // ignore
            }
        }

        // Upload new avatar
        $result = $cloudinary->upload(
            $request->file('avatar')->getRealPath(),
            [
                'folder'         => 'whispr/avatars',
                'public_id'      => 'user_' . $user->id,
                'overwrite'      => true,
                'transformation' => [
                    'width'  => 200,
                    'height' => 200,
                    'crop'   => 'fill',
                    'gravity'=> 'face',
                ],
            ]
        );

        $user->update([
            'avatar'           => $result['url'],
            'avatar_public_id' => $result['public_id'],
        ]);

        return response()->json([
            'avatar_url' => $result['url'],
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password'      => 'required',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $user = $request->user();

        if (!\Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->update(['password' => \Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully']);
    }
}
