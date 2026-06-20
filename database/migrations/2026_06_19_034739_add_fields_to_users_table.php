<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('name');
            $table->string('avatar')->nullable()->after('username');
            $table->string('role')->default('user')->after('avatar');
            $table->string('status')->nullable()->after('role');
            $table->string('bio')->nullable()->after('status');
            $table->boolean('is_online')->default(false)->after('bio');
            $table->timestamp('last_seen_at')->nullable()->after('is_online');
            $table->boolean('is_banned')->default(false)->after('last_seen_at');
            $table->timestamp('banned_at')->nullable()->after('is_banned');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username', 'avatar', 'role', 'status',
                'bio', 'is_online', 'last_seen_at',
                'is_banned', 'banned_at'
            ]);
        });
    }
};