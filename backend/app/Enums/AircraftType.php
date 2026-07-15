<?php

namespace App\Enums;

enum AircraftType: string
{
    case Atr = 'ATR';
    case Airbus320 = 'Airbus 320';
    case Boeing737Max = 'Boeing 737 Max';

    public function maximumRow(): int
    {
        return match ($this) {
            self::Atr => 18,
            self::Airbus320, self::Boeing737Max => 32,
        };
    }

    /**
     * @return list<string>
     */
    public function seatLetters(): array
    {
        return match ($this) {
            self::Atr => ['A', 'B', 'C', 'D'],
            self::Airbus320, self::Boeing737Max => ['A', 'B', 'C', 'D', 'E', 'F'],
        };
    }
}
