import {
  type ChangeEvent,
  type RefObject,
  type SubmitEvent,
  useRef,
  useState,
} from 'react'
import {
  ApiError,
  aircraftTypes,
  generateVouchers,
  type AircraftType,
  type GenerateVoucherRequest,
} from './api/vouchers'

interface VoucherFormState extends Omit<GenerateVoucherRequest, 'aircraft'> {
  aircraft: AircraftType | ''
}

type FormField = keyof VoucherFormState
type FormErrors = Partial<Record<FormField, string>>

interface VoucherResult {
  seats: [string, string, string]
  flightNumber: string
  date: string
  aircraft: AircraftType
}

type SubmissionStatus =
  | { type: 'idle' }
  | { type: 'generating' }
  | { type: 'duplicate'; message: string }
  | { type: 'error'; message: string }
  | { type: 'success'; result: VoucherResult }

const initialForm: VoucherFormState = {
  name: '',
  id: '',
  flightNumber: '',
  date: '',
  aircraft: '',
}

const fieldOrder: FormField[] = [
  'name',
  'id',
  'flightNumber',
  'date',
  'aircraft',
]

function formatDate(date: string) {
  const [year, month, day] = date.split('-')
  return year && month && day ? `${day}-${month}-${year}` : date
}

function normalizeForm(form: VoucherFormState): VoucherFormState {
  return {
    name: form.name.trim(),
    id: form.id.trim(),
    flightNumber: form.flightNumber.trim().toUpperCase(),
    date: form.date,
    aircraft: form.aircraft,
  }
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return 'Something went wrong. Try again.'
  }

  if (error.status === 0) {
    return 'Cannot connect to the API. Check the connection and try again.'
  }

  if (error.status === 429) {
    return 'Too many requests. Wait a moment and try again.'
  }

  if (error.status >= 500) {
    return 'The service is unavailable. Try again.'
  }

  return error.message
}

interface StatusPanelProps {
  status: SubmissionStatus
  statusRef: RefObject<HTMLDivElement | null>
  onReset: () => void
}

function StatusPanel({ status, statusRef, onReset }: StatusPanelProps) {
  const isProblem = status.type === 'error' || status.type === 'duplicate'

  return (
    <section className="min-h-65 border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="result-heading">
      <h2 id="result-heading" className="mb-6 text-base font-semibold text-slate-900">Result</h2>

      <div
        ref={statusRef}
        className="outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        role={isProblem ? 'alert' : 'status'}
        aria-live={isProblem ? 'assertive' : 'polite'}
        aria-atomic="true"
        tabIndex={-1}
      >
        {status.type === 'idle' ? (
          <p className="text-sm text-slate-500">No vouchers generated.</p>
        ) : null}

        {status.type === 'generating' ? (
          <p className="text-sm text-slate-500">Generating seats...</p>
        ) : null}

        {status.type === 'duplicate' ? (
          <div className="border border-rose-200 bg-rose-50 p-3.5 text-red-700">
            <strong className="block text-sm">Vouchers already generated</strong>
            <p className="mt-1.5 text-sm leading-6">{status.message}</p>
            <button type="button" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" onClick={onReset}>
              New assignment
            </button>
          </div>
        ) : null}

        {status.type === 'error' ? (
          <div className="border border-rose-200 bg-rose-50 p-3.5 text-red-700">
            <strong className="block text-sm">Could not generate vouchers</strong>
            <p className="mt-1.5 text-sm leading-6">{status.message}</p>
          </div>
        ) : null}

        {status.type === 'success' ? (
          <div>
            <dl className="mb-4 grid grid-cols-1 gap-3 border-b border-slate-200 pb-4 sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Flight</dt>
                <dd className="mt-1 truncate text-sm font-semibold text-slate-900">{status.result.flightNumber}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Date</dt>
                <dd className="mt-1 truncate text-sm font-semibold text-slate-900">{formatDate(status.result.date)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">Aircraft</dt>
                <dd className="mt-1 truncate text-sm font-semibold text-slate-900">{status.result.aircraft}</dd>
              </div>
            </dl>

            <div className="mb-4 grid grid-cols-3 gap-2" aria-label="Generated voucher seats">
              {status.result.seats.map((seat) => (
                <strong key={seat} className="border border-blue-200 bg-blue-50 px-2 py-4 text-center text-2xl text-blue-600">{seat}</strong>
              ))}
            </div>

            <button type="button" className="inline-flex min-h-11 items-center justify-center rounded-sm border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" onClick={onReset}>
              New assignment
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function App() {
  const [form, setForm] = useState<VoucherFormState>(initialForm)
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<SubmissionStatus>({ type: 'idle' })
  const nameRef = useRef<HTMLInputElement>(null)
  const idRef = useRef<HTMLInputElement>(null)
  const flightNumberRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const aircraftRef = useRef<HTMLSelectElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)
  const isSubmitting = status.type === 'generating'

  function focusStatus() {
    requestAnimationFrame(() => statusRef.current?.focus())
  }

  function focusFirstError(nextErrors: FormErrors) {
    const field = fieldOrder.find((name) => nextErrors[name])

    if (!field) {
      return
    }

    const ref = {
      name: nameRef,
      id: idRef,
      flightNumber: flightNumberRef,
      date: dateRef,
      aircraft: aircraftRef,
    }[field]

    requestAnimationFrame(() => ref.current?.focus())
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = event.target.name as FormField
    const value = field === 'flightNumber'
      ? event.target.value.toUpperCase()
      : event.target.value

    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      const next = { ...current }
      delete next[field]
      return next
    })

    if (status.type !== 'idle') {
      setStatus({ type: 'idle' })
    }
  }

  function applyApiFieldErrors(error: ApiError) {
    const apiErrors: FormErrors = {}

    for (const field of fieldOrder) {
      const message = error.fieldErrors?.[field]?.[0]
      if (message) {
        apiErrors[field] = message
      }
    }

    if (Object.keys(apiErrors).length === 0) {
      return false
    }

    setErrors(apiErrors)
    focusFirstError(apiErrors)
    return true
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const normalized = normalizeForm(form)
    setForm(normalized)
    setErrors({})

    try {
      setStatus({ type: 'generating' })
      const request: GenerateVoucherRequest = {
        ...normalized,
        aircraft: normalized.aircraft as AircraftType,
      }
      const generated = await generateVouchers(request)

      setStatus({
        type: 'success',
        result: {
          seats: generated.seats,
          flightNumber: normalized.flightNumber,
          date: normalized.date,
          aircraft: request.aircraft,
        },
      })
      focusStatus()
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setStatus({ type: 'duplicate', message: error.message })
        focusStatus()
        return
      }

      const hasFieldErrors = error instanceof ApiError && applyApiFieldErrors(error)
      setStatus({
        type: 'error',
        message: hasFieldErrors ? 'Review the highlighted fields.' : getErrorMessage(error),
      })

      if (!hasFieldErrors) {
        focusStatus()
      }
    }
  }

  function resetAssignment() {
    setForm(initialForm)
    setErrors({})
    setStatus({ type: 'idle' })
    requestAnimationFrame(() => nameRef.current?.focus())
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      <main id="assignment" className="min-h-screen px-3.5 py-6 sm:px-6 sm:py-12 lg:px-16">
        <header className="mx-auto mb-6 w-full max-w-6xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Voucher Assignment</h1>
          <p className="mt-2 text-sm text-slate-500">Generate three seats for an eligible flight.</p>
        </header>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <section className="border border-slate-200 bg-white p-4 sm:p-6" aria-labelledby="form-heading">
            <h2 id="form-heading" className="mb-6 text-base font-semibold text-slate-900">Flight details</h2>

            <form onSubmit={handleSubmit}>
              <fieldset disabled={isSubmitting} className="m-0 border-0 p-0 disabled:opacity-65">
                <legend className="sr-only">Voucher assignment information</legend>

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex min-w-0 flex-col">
                    <label htmlFor="name" className="mb-1.5 text-sm font-semibold text-slate-900">Crew name</label>
                    <input
                      ref={nameRef}
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      maxLength={255}
                      autoComplete="name"
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className="min-h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 aria-invalid:border-red-700"
                    />
                    {errors.name ? <span id="name-error" className="mt-1 text-xs text-red-700">{errors.name}</span> : null}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <label htmlFor="id" className="mb-1.5 text-sm font-semibold text-slate-900">Crew ID</label>
                    <input
                      ref={idRef}
                      id="id"
                      name="id"
                      type="text"
                      value={form.id}
                      onChange={handleChange}
                      required
                      maxLength={100}
                      autoComplete="off"
                      aria-invalid={Boolean(errors.id)}
                      aria-describedby={errors.id ? 'id-error' : undefined}
                      className="min-h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 aria-invalid:border-red-700"
                    />
                    {errors.id ? <span id="id-error" className="mt-1 text-xs text-red-700">{errors.id}</span> : null}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <label htmlFor="flightNumber" className="mb-1.5 text-sm font-semibold text-slate-900">Flight number</label>
                    <input
                      ref={flightNumberRef}
                      id="flightNumber"
                      name="flightNumber"
                      type="text"
                      value={form.flightNumber}
                      onChange={handleChange}
                      required
                      maxLength={20}
                      pattern="[A-Z0-9-]+"
                      title="Use letters, numbers, and hyphens only."
                      autoCapitalize="characters"
                      autoComplete="off"
                      placeholder="GA102"
                      aria-invalid={Boolean(errors.flightNumber)}
                      aria-describedby={errors.flightNumber ? 'flightNumber-error' : undefined}
                      className="min-h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 aria-invalid:border-red-700"
                    />
                    {errors.flightNumber ? <span id="flightNumber-error" className="mt-1 text-xs text-red-700">{errors.flightNumber}</span> : null}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <label htmlFor="date" className="mb-1.5 text-sm font-semibold text-slate-900">Flight date</label>
                    <input
                      ref={dateRef}
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      aria-invalid={Boolean(errors.date)}
                      aria-describedby={errors.date ? 'date-error' : undefined}
                      className="min-h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 aria-invalid:border-red-700"
                    />
                    {errors.date ? <span id="date-error" className="mt-1 text-xs text-red-700">{errors.date}</span> : null}
                  </div>

                  <div className="flex min-w-0 flex-col sm:col-span-2">
                    <label htmlFor="aircraft" className="mb-1.5 text-sm font-semibold text-slate-900">Aircraft type</label>
                    <select
                      ref={aircraftRef}
                      id="aircraft"
                      name="aircraft"
                      value={form.aircraft}
                      onChange={handleChange}
                      required
                      aria-invalid={Boolean(errors.aircraft)}
                      aria-describedby={errors.aircraft ? 'aircraft-error' : undefined}
                      className="min-h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 aria-invalid:border-red-700"
                    >
                      <option value="" disabled>Select aircraft</option>
                      {aircraftTypes.map((aircraft) => (
                        <option key={aircraft} value={aircraft}>{aircraft}</option>
                      ))}
                    </select>
                    {errors.aircraft ? <span id="aircraft-error" className="mt-1 text-xs text-red-700">{errors.aircraft}</span> : null}
                  </div>
                </div>
              </fieldset>

              <button type="submit" className="inline-flex min-h-11 w-full min-w-40 items-center justify-center rounded-sm border border-blue-600 bg-blue-600 px-4 text-sm font-semibold text-white hover:border-blue-700 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-wait disabled:opacity-70 sm:w-auto" disabled={isSubmitting}>
                {status.type === 'generating' ? 'Generating...' : 'Generate vouchers'}
              </button>
            </form>
          </section>

          <StatusPanel status={status} statusRef={statusRef} onReset={resetAssignment} />
        </div>
      </main>
    </div>
  )
}

export default App
