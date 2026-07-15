# Astronacci Airline Voucher Assignment

This repository contains the assessment applications:

- `backend/`: Laravel 13 REST API backed by SQLite.
- `frontend/`: React 19 voucher assignment console.

Docker and Laravel Sail are not required for this setup.

## Prerequisites

- PHP 8.3 or newer with `pdo_sqlite` and `sqlite3` enabled
- Composer 2
- Node.js 20 or newer and npm

## Backend setup

Run the following commands from the repository root:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

The default configuration uses `backend/database/database.sqlite`. If you prefer to specify the file explicitly, set an absolute path in `backend/.env`:

```dotenv
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/backend/database/database.sqlite
```

Create the file if it does not exist, then run the migrations:

```bash
touch database/database.sqlite
php artisan migrate
```

The JSON response helpers are registered through Composer's `autoload.files`. Composer regenerates its autoloader during installation; after changing helper registration manually, run:

```bash
composer dump-autoload
```

Start the API:

```bash
php artisan serve
```

The API is available at `http://127.0.0.1:8000`.

## Frontend setup

In a separate terminal, install and start the React application:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend is available at `http://localhost:5173`. It uses
`http://127.0.0.1:8000/api` by default. To use a different API URL, update:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## CORS

The backend allows the frontend origin configured in `backend/.env`:

```dotenv
FRONTEND_URL=http://localhost:5173
```

Credentials are disabled because these public assessment endpoints do not use authentication.

## API

Check whether a flight already has vouchers:

```bash
curl -X POST http://127.0.0.1:8000/api/check \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"flightNumber":"GA102","date":"2026-08-12"}'
```

Generate three vouchers:

```bash
curl -X POST http://127.0.0.1:8000/api/generate \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sarah","id":"00123","flightNumber":"GA102","date":"2026-08-12","aircraft":"Airbus 320"}'
```

Supported aircraft values are `ATR`, `Airbus 320`, and `Boeing 737 Max`. Dates must use `YYYY-MM-DD`.

Successful responses use this envelope:

```json
{
  "success": true,
  "message": "Vouchers generated successfully.",
  "code": 201,
  "data": {
    "seats": ["3B", "7C", "14D"]
  }
}
```

Generating vouchers again for the same flight and date returns HTTP `409`.

## Quality checks

Run from `backend/`:

```bash
php artisan test --compact
vendor/bin/phpstan analyse
vendor/bin/pint --test
```

Run the frontend checks from `frontend/`:

```bash
npm run lint
npm run build
```
