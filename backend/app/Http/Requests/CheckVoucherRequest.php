<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CheckVoucherRequest extends FormRequest
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
            'flightNumber' => ['required', 'string', 'max:20', 'regex:/^[A-Z0-9-]+$/'],
            'date' => ['required', 'string', 'date_format:Y-m-d'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'flightNumber.required' => 'The flight number is required.',
            'flightNumber.regex' => 'The flight number may only contain letters, numbers, and hyphens.',
            'date.required' => 'The flight date is required.',
            'date.date_format' => 'The flight date must use the YYYY-MM-DD format.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $flightNumber = $this->input('flightNumber');
        $date = $this->input('date');

        $this->merge([
            'flightNumber' => is_string($flightNumber) ? str($flightNumber)->trim()->upper()->toString() : $flightNumber,
            'date' => is_string($date) ? str($date)->trim()->toString() : $date,
        ]);
    }
}
