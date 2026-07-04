<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_public_id')->nullable()->after('avatar');
        });

        Schema::table('attachments', function (Blueprint $table) {
            $table->string('cloudinary_id')->nullable()->after('size');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar_public_id');
        });

        Schema::table('attachments', function (Blueprint $table) {
            $table->dropColumn('cloudinary_id');
        });
    }
};
