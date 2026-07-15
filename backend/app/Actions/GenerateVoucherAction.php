<?php

namespace App\Actions;

use App\Enums\AircraftType;
use App\Exceptions\VoucherAlreadyGeneratedException;
use App\Models\Voucher;
use App\Services\SeatGeneratorService;
use Illuminate\Database\UniqueConstraintViolationException;

class GenerateVoucherAction
{
    public function __construct(private SeatGeneratorService $seatGenerator) {}

    /**
     * @param  array{name: string, id: string, flightNumber: string, date: string, aircraft: string}  $data
     */
    public function handle(array $data): Voucher
    {
        if (Voucher::query()->forFlight($data['flightNumber'], $data['date'])->exists()) {
            throw new VoucherAlreadyGeneratedException;
        }

        $aircraftType = AircraftType::from($data['aircraft']);
        $seats = $this->seatGenerator->generate($aircraftType);

        try {
            return Voucher::query()->create([
                'crew_name' => $data['name'],
                'crew_id' => $data['id'],
                'flight_number' => $data['flightNumber'],
                'flight_date' => $data['date'],
                'aircraft_type' => $aircraftType,
                'seat1' => $seats[0],
                'seat2' => $seats[1],
                'seat3' => $seats[2],
            ]);
        } catch (UniqueConstraintViolationException $exception) {
            throw new VoucherAlreadyGeneratedException(previous: $exception);
        }
    }
}
