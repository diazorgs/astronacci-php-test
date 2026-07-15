<?php

use App\Enums\AircraftType;
use App\Models\Voucher;
use App\Services\SeatGeneratorService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Response;

use function Pest\Laravel\mock;

function validVoucherPayload(array $overrides = []): array
{
    return array_replace([
        'name' => 'Sarah',
        'id' => '00123',
        'flightNumber' => 'GA102',
        'date' => '2026-08-12',
        'aircraft' => 'Airbus 320',
    ], $overrides);
}

test('autoloads the JSON response helpers with the expected empty data envelopes', function () {
    expect(function_exists('response_success'))->toBeTrue()
        ->and(function_exists('response_failed'))->toBeTrue();

    $success = response_success('Completed.');
    $failure = response_failed('Missing.');

    expect($success->getStatusCode())->toBe(Response::HTTP_OK)
        ->and($success->getData(true))->toBe([
            'success' => true,
            'message' => 'Completed.',
            'code' => Response::HTTP_OK,
            'data' => [],
        ])
        ->and($failure->getStatusCode())->toBe(Response::HTTP_NOT_FOUND)
        ->and($failure->getData(true))->toBe([
            'success' => false,
            'message' => 'Missing.',
            'code' => Response::HTTP_NOT_FOUND,
            'data' => [],
        ]);
});

test('reports that a flight has no voucher assignment', function () {
    $this->postJson(route('vouchers.check'), [
        'flightNumber' => ' ga102 ',
        'date' => '2026-08-12',
    ])->assertOk()->assertExactJson([
        'success' => true,
        'message' => 'Voucher availability checked successfully.',
        'code' => Response::HTTP_OK,
        'data' => ['exists' => false],
    ]);
});

test('reports that a normalized flight already has a voucher assignment', function () {
    Voucher::factory()->create([
        'flight_number' => 'GA102',
        'flight_date' => '2026-08-12',
    ]);

    $this->postJson(route('vouchers.check'), [
        'flightNumber' => ' ga102 ',
        'date' => '2026-08-12',
    ])->assertOk()->assertExactJson([
        'success' => true,
        'message' => 'Voucher availability checked successfully.',
        'code' => Response::HTTP_OK,
        'data' => ['exists' => true],
    ]);
});

test('generates and persists a normalized voucher assignment', function () {
    mock(SeatGeneratorService::class)
        ->shouldReceive('generate')
        ->once()
        ->with(AircraftType::Airbus320)
        ->andReturn(['3B', '7C', '14D']);

    $this->postJson(route('vouchers.generate'), validVoucherPayload([
        'name' => ' Sarah ',
        'id' => ' 00123 ',
        'flightNumber' => ' ga102 ',
    ]))->assertCreated()->assertExactJson([
        'success' => true,
        'message' => 'Vouchers generated successfully.',
        'code' => Response::HTTP_CREATED,
        'data' => ['seats' => ['3B', '7C', '14D']],
    ]);

    $voucher = Voucher::query()->sole();

    $this->assertModelExists($voucher);

    expect($voucher->crew_name)->toBe('Sarah')
        ->and($voucher->crew_id)->toBe('00123')
        ->and($voucher->flight_number)->toBe('GA102')
        ->and($voucher->flight_date)->toBe('2026-08-12')
        ->and($voucher->aircraft_type)->toBe(AircraftType::Airbus320)
        ->and([$voucher->seat1, $voucher->seat2, $voucher->seat3])->toBe(['3B', '7C', '14D']);
});

test('rejects invalid voucher generation input', function (array $payload, string $field) {
    $this->postJson(route('vouchers.generate'), $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'missing crew name' => [array_diff_key(validVoucherPayload(), ['name' => true]), 'name'],
    'missing crew ID' => [array_diff_key(validVoucherPayload(), ['id' => true]), 'id'],
    'missing flight number' => [array_diff_key(validVoucherPayload(), ['flightNumber' => true]), 'flightNumber'],
    'missing date' => [array_diff_key(validVoucherPayload(), ['date' => true]), 'date'],
    'missing aircraft' => [array_diff_key(validVoucherPayload(), ['aircraft' => true]), 'aircraft'],
    'invalid date format' => [validVoucherPayload(['date' => '12-08-2026']), 'date'],
    'invalid flight number' => [validVoucherPayload(['flightNumber' => 'GA 102!']), 'flightNumber'],
    'unsupported aircraft' => [validVoucherPayload(['aircraft' => 'Boeing 747']), 'aircraft'],
]);

test('returns a wrapped conflict without creating a duplicate assignment', function () {
    Voucher::factory()->create([
        'flight_number' => 'GA102',
        'flight_date' => '2026-08-12',
    ]);

    $this->postJson(route('vouchers.generate'), validVoucherPayload([
        'flightNumber' => ' ga102 ',
    ]))->assertConflict()->assertExactJson([
        'success' => false,
        'message' => 'Vouchers have already been generated for this flight and date.',
        'code' => Response::HTTP_CONFLICT,
        'data' => [],
    ]);

    expect(Voucher::query()->count())->toBe(1);
});

test('enforces flight and date uniqueness at the database level', function () {
    Voucher::factory()->create([
        'flight_number' => 'GA102',
        'flight_date' => '2026-08-12',
    ]);

    expect(fn () => Voucher::factory()->create([
        'flight_number' => 'GA102',
        'flight_date' => '2026-08-12',
    ]))->toThrow(UniqueConstraintViolationException::class);
});

test('allows preflight requests from the configured frontend origin', function () {
    $this->withHeaders([
        'Origin' => 'http://localhost:5173',
        'Access-Control-Request-Method' => 'POST',
        'Access-Control-Request-Headers' => 'Content-Type',
    ])->options('/api/check')
        ->assertNoContent()
        ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
});
