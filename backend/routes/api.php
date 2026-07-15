<?php

use App\Http\Controllers\Api\VoucherController;
use Illuminate\Support\Facades\Route;

Route::controller(VoucherController::class)
    ->middleware('throttle:60,1')
    ->group(function (): void {
        Route::post('/check', 'check')->name('vouchers.check');
        Route::post('/generate', 'generate')->name('vouchers.generate');
    });
