<?php

use Illuminate\Support\Facades\Route;

// Catch ALL routes and serve the React SPA
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');