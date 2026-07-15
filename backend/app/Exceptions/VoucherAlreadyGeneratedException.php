<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Contracts\Debug\ShouldntReport;

class VoucherAlreadyGeneratedException extends Exception implements ShouldntReport {}
