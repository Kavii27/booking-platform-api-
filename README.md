# Booking Platform API

A REST API built with **NestJS** and **PostgreSQL** for managing services and customer bookings. Built as part of the EN2H Software Engineer Intern technical assignment.

## Project Overview

This API allows authenticated users (staff/admins) to manage services (create, update, delete, list), while customers can create bookings without needing an account. It enforces business rules such as preventing bookings in the past, preventing double-bookings for the same service/date/time slot, and preventing cancelled bookings from being marked as completed.

### Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM (with migrations)
- **Auth**: JWT (Passport)
- **Validation**: class-validator / class-transformer
- **API Docs**: Swagger

### Core Features

- JWT Authentication (Register, Login)
- Service Management (CRUD) — protected, authenticated users only
- Booking Management (Create, List, Get by ID, Update Status, Cancel)
- Business rule enforcement (past-date prevention, valid service reference, status transition rules)
- Global exception handling with consistent error response format

### Bonus Features Implemented

- ✅ Pagination (on bookings list)
- ✅ Search bookings (by customer name/email)
- ✅ Filter bookings by status
- ✅ Swagger API documentation
- ✅ Validation (class-validator on all DTOs)
- ✅ Global Exception Handling
- ✅ Prevent duplicate bookings (same service, date, and time)

---

## Installation Steps

### Prerequisites

- Node.js v18+
- npm
- PostgreSQL (installed and running locally)

### Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/booking-platform-api.git
cd booking-platform-api

# Install dependencies
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your local values:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USER` | PostgreSQL username | `postgres` |
| `DATABASE_PASSWORD` | PostgreSQL password | `your_password` |
| `DATABASE_NAME` | Database name | `booking_platform` |
| `JWT_SECRET` | Secret used to sign JWT tokens | `some-long-random-string` |
| `JWT_EXPIRES_IN` | JWT token expiry | `1d` |

---

## Database Setup

Create the database (using `psql` or any PostgreSQL client):

```sql
CREATE DATABASE booking_platform;
```

Make sure the `DATABASE_*` values in your `.env` match your local PostgreSQL credentials.

---

## Running Migrations

This project uses TypeORM migrations to manage the database schema (no `synchronize: true` in production/submission code).

```bash
# Run all pending migrations
npm run migration:run

# Revert the last migration (if needed)
npm run migration:revert

# Generate a new migration after changing an entity
npm run migration:generate -- src/migrations/MigrationName
```

Running `migration:run` will create the `users`, `services`, and `bookings` tables.

---

## Running the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`.

---

## API Documentation

Interactive Swagger documentation is available once the app is running:

```
http://localhost:3000/api/docs
```

Use the **Authorize** button in Swagger UI to attach a JWT token (obtained from `/auth/login` or `/auth/register`) to test protected routes.

### Key Endpoints

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/login` | No | Login and receive JWT |
| POST | `/services` | Yes | Create a service |
| GET | `/services` | Yes | Get all services |
| GET | `/services/:id` | Yes | Get service by ID |
| PATCH | `/services/:id` | Yes | Update a service |
| DELETE | `/services/:id` | Yes | Delete a service |
| POST | `/bookings` | No | Create a booking (public) |
| GET | `/bookings` | Yes | Get all bookings (supports `page`, `limit`, `search`, `status` query params) |
| GET | `/bookings/:id` | Yes | Get booking by ID |
| PATCH | `/bookings/:id/status` | Yes | Update booking status |
| PATCH | `/bookings/:id/cancel` | Yes | Cancel a booking |

---

## Assumptions Made

- **Service management routes are fully protected**: per the business rule "Only authenticated users can manage services," all Service endpoints (including Get All / Get by ID) require a JWT — not just Create/Update/Delete.
- **Booking management routes (beyond creation) require authentication**: the assignment only explicitly states booking *creation* is public. Get All, Get by ID, Update Status, and Cancel are treated as staff-facing management actions and are JWT-protected, in the spirit of the same "only authenticated users manage" principle applied to services.
- **Completed bookings cannot be cancelled**: this wasn't explicitly stated, but was added as a natural extension of the stated rule ("cancelled bookings cannot be marked as completed") to keep booking status transitions consistent in both directions.
- **Duplicate booking prevention checks all bookings regardless of status**: a cancelled booking still "occupies" that service/date/time slot in the current implementation, rather than freeing it up. This was the simpler, stricter interpretation of the requirement.
- **`isActive` on services** is stored but not currently used to filter results (e.g., inactive services still appear in `GET /services` and can still be booked). Filtering by `isActive` was out of scope for the listed requirements.

---

## Future Improvements

- **Refresh Tokens**: implement a refresh token flow (short-lived access tokens + long-lived refresh tokens) for better session security. This was scoped out due to time constraints during the assignment window.
- **Unit Testing**: add unit tests (Jest + `@nestjs/testing`) covering `AuthService`, `ServicesService`, and `BookingsService`, mocking repository/database dependencies.
- **Docker Support**: containerize the app and PostgreSQL with `docker-compose` for a fully reproducible one-command setup.
- **Role-based access control**: currently any authenticated user can manage all services/bookings; a real system would likely need admin vs staff role distinctions.
- **Soft deletes**: consider soft-deleting services (using `isActive`) instead of hard deletes, to preserve booking history referencing a since-removed service.
- **Rate limiting** on public endpoints (e.g., `POST /bookings`) to prevent abuse, since it requires no authentication.

---

## Author's Notes

This project was built incrementally, module by module (Auth → Services → Bookings → bonus features → migrations), following NestJS conventions throughout (modular architecture, DTO-based validation, dependency injection, guard-based route protection). `synchronize: true` was used temporarily during early development for speed, then replaced with proper TypeORM migrations before submission, per the assignment's requirements.
