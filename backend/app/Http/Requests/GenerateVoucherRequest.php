<?php

namespace App\Http\Requests;

use App\Enums\AircraftType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateVoucherRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'id' => ['required', 'string', 'max:100'],
            'flightNumber' => ['required', 'string', 'max:20', 'regex:/^[A-Z0-9-]+$/'],
            'date' => ['required', 'string', 'date_format:Y-m-d'],
            'aircraft' => ['required', 'string', Rule::enum(AircraftType::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The crew name is required.',
            'id.required' => 'The crew ID is required.',
            'flightNumber.required' => 'The flight number is required.',
            'flightNumber.regex' => 'The flight number may only contain letters, numbers, and hyphens.',
            'date.required' => 'The flight date is required.',
            'date.date_format' => 'The flight date must use the YYYY-MM-DD format.',
            'aircraft.required' => 'The aircraft type is required.',
            'aircraft.enum' => 'The selected aircraft type is invalid.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $normalized = [];

        foreach (['name', 'id', 'date', 'aircraft'] as $field) {
            $value = $this->input($field);
            $normalized[$field] = is_string($value) ? str($value)->trim()->toString() : $value;
        }

        $flightNumber = $this->input('flightNumber');
        $normalized['flightNumber'] = is_string($flightNumber)
            ? str($flightNumber)->trim()->upper()->toString()
            : $flightNumber;

        $this->merge($normalized);
    }
}
