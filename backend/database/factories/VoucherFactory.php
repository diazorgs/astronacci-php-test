<?php

namespace Database\Factories;

use App\Enums\AircraftType;
use App\Models\Voucher;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Voucher>
 */
class VoucherFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'crew_name' => fake()->name(),
            'crew_id' => fake()->numerify('#####'),
            'flight_number' => Str::upper(fake()->unique()->bothify('??###')),
            'flight_date' => fake()->date('Y-m-d'),
            'aircraft_type' => AircraftType::Airbus320,
            'seat1' => '1A',
            'seat2' => '1B',
            'seat3' => '1C',
        ];
    }
}
