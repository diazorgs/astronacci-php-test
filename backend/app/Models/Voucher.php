<?php

namespace App\Models;

use App\Enums\AircraftType;
use Database\Factories\VoucherFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $crew_name
 * @property string $crew_id
 * @property string $flight_number
 * @property string $flight_date
 * @property AircraftType $aircraft_type
 * @property string $seat1
 * @property string $seat2
 * @property string $seat3
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static Builder<static> forFlight(string $flightNumber, string $flightDate)
 */
#[Fillable([
    'crew_name',
    'crew_id',
    'flight_number',
    'flight_date',
    'aircraft_type',
    'seat1',
    'seat2',
    'seat3',
])]
class Voucher extends Model
{
    /** @use HasFactory<VoucherFactory> */
    use HasFactory;

    /**
     * @param  Builder<Voucher>  $query
     * @return Builder<Voucher>
     */
    public function scopeForFlight(Builder $query, string $flightNumber, string $flightDate): Builder
    {
        return $query
            ->where('flight_number', $flightNumber)
            ->where('flight_date', $flightDate);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'aircraft_type' => AircraftType::class,
        ];
    }
}
