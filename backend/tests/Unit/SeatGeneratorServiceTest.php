<?php

use App\Enums\AircraftType;
use App\Services\SeatGeneratorService;

test('generates three unique seats valid for the aircraft layout', function (
    AircraftType $aircraftType,
    int $maximumRow,
    array $seatLetters,
) {
    $seats = (new SeatGeneratorService)->generate($aircraftType);

    expect($seats)
        ->toHaveCount(3)
        ->and(array_unique($seats))->toHaveCount(3);

    foreach ($seats as $seat) {
        preg_match('/^(\d+)([A-F])$/', $seat, $matches);

        expect($matches)->toHaveCount(3)
            ->and((int) $matches[1])->toBeBetween(1, $maximumRow)
            ->and($matches[2])->toBeIn($seatLetters);
    }
})->with([
    'ATR' => [AircraftType::Atr, 18, ['A', 'C', 'D', 'F']],
    'Airbus 320' => [AircraftType::Airbus320, 32, ['A', 'B', 'C', 'D', 'E', 'F']],
    'Boeing 737 Max' => [AircraftType::Boeing737Max, 32, ['A', 'B', 'C', 'D', 'E', 'F']],
]);
