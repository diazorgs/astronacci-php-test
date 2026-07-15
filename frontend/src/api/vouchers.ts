export const aircraftTypes = [
  'ATR',
  'Airbus 320',
  'Boeing 737 Max',
] as const

export type AircraftType = (typeof aircraftTypes)[number]

export interface GenerateVoucherRequest {
  name: string
  id: string
  flightNumber: string
  date: string
  aircraft: AircraftType
}

interface ApiSuccess<T> {
  success: true
  message: string
  code: number
  data: T
}

interface GeneratedVoucherData {
  seats: [string, string, string]
}

interface ValidationErrorResponse {
  message: string
  errors: Record<string, string[]>
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors?: Record<string, string[]>

  constructor(
    status: number,
    message: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const apiBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '')

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getValidationErrors(value: unknown) {
  if (!isRecord(value) || !isRecord(value.errors)) {
    return undefined
  }

  const fieldErrors: Record<string, string[]> = {}

  for (const [field, messages] of Object.entries(value.errors)) {
    if (Array.isArray(messages) && messages.every((message) => typeof message === 'string')) {
      fieldErrors[field] = messages
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
}

function getResponseMessage(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.message === 'string'
    ? value.message
    : fallback
}

async function post<T>(path: string, payload: object): Promise<ApiSuccess<T>> {
  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ApiError(0, 'Unable to connect to the voucher service.')
  }

  let body: unknown

  try {
    body = await response.json()
  } catch {
    throw new ApiError(response.status, 'The voucher service returned an unreadable response.')
  }

  if (!response.ok) {
    const validation = body as Partial<ValidationErrorResponse>
    throw new ApiError(
      response.status,
      getResponseMessage(validation, 'The request could not be completed.'),
      getValidationErrors(validation),
    )
  }

  if (
    !isRecord(body)
    || body.success !== true
    || typeof body.message !== 'string'
    || typeof body.code !== 'number'
    || !('data' in body)
  ) {
    throw new ApiError(response.status, 'The voucher service returned an unexpected response.')
  }

  return body as unknown as ApiSuccess<T>
}

export async function generateVouchers(payload: GenerateVoucherRequest) {
  const response = await post<GeneratedVoucherData>('/generate', payload)
  const seats = isRecord(response.data) ? response.data.seats : undefined

  if (
    !Array.isArray(seats)
    || seats.length !== 3
    || !seats.every((seat) => typeof seat === 'string')
    || new Set(seats).size !== 3
  ) {
    throw new ApiError(response.code, 'The voucher service returned an unexpected response.')
  }

  return { seats: seats as [string, string, string] }
}
