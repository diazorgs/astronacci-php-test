<?php

namespace App\Services;

use App\Enums\AircraftType;

class SeatGeneratorService
{
    /**
     * @return list<string>
     */
    public function generate(AircraftType $aircraftType): array
    {
        $availableSeats = [];

        foreach (range(1, $aircraftType->maximumRow()) as $row) {
            foreach ($aircraftType->seatLetters() as $seatLetter) {
                $availableSeats[] = $row.$seatLetter;
            }
        }

        return array_values(
            collect($availableSeats)
                ->random(3)
                ->all(),
        );
    }
}
