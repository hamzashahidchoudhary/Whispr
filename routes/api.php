<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{id}', [UserController::class, 'show']);

    // Profile
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // Conversations
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::post('/conversations/{conversation}/read', [ConversationController::class, 'markRead']);

    // Messages
    Route::get('/conversations/{conversationId}/messages', [MessageController::class, 'index']);
    Route::post('/conversations/{conversationId}/messages', [MessageController::class, 'store']);
    Route::put('/messages/{message}', [MessageController::class, 'update']);
    Route::delete('/messages/{message}', [MessageController::class, 'destroy']);
    Route::post('/messages/{message}/react', [MessageController::class, 'react']);

    // Groups
    Route::get('/groups', [GroupController::class, 'index']);
    Route::post('/groups', [GroupController::class, 'store']);
    Route::get('/groups/{group}', [GroupController::class, 'show']);
    Route::put('/groups/{group}', [GroupController::class, 'update']);
    Route::delete('/groups/{group}', [GroupController::class, 'destroy']);
    Route::post('/groups/{group}/members', [GroupController::class, 'addMember']);
    Route::delete('/groups/{group}/members/{userId}', [GroupController::class, 'removeMember']);
    Route::post('/groups/{group}/promote/{userId}', [GroupController::class, 'promoteMember']);
    Route::post('/groups/{group}/leave', [GroupController::class, 'leaveGroup']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);

        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{id}', [AdminController::class, 'showUser']);
        Route::post('/users/{id}/ban', [AdminController::class, 'ban']);
        Route::post('/users/{id}/unban', [AdminController::class, 'unban']);
        Route::post('/users/{id}/make-admin', [AdminController::class, 'makeAdmin']);
        Route::post('/users/{id}/remove-admin', [AdminController::class, 'removeAdmin']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        Route::get('/messages', [AdminController::class, 'messages']);
        Route::delete('/messages/{id}', [AdminController::class, 'deleteMessage']);

        Route::get('/groups', [AdminController::class, 'groups']);
        Route::delete('/groups/{id}', [AdminController::class, 'deleteGroup']);
    });
});
