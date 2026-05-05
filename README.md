# TraceUPI — UPI Transaction Failure Tracker

Built this after noticing that failed UPI transactions have no real resolution path — banks just say "try again" with no visibility into what's happening. TraceUPI tracks each failed transaction through a strict state machine until it's closed, with auto-escalation, SMS alerts, and a full audit trail.

![Java](https://img.shields.io/badge/Java-17-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-green)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-blue)

---

## Features

- **Transaction Lifecycle Management** — State machine enforcing `FAILED → UNDER_REVIEW → ESCALATED → RESOLVED → CLOSED` (forward-only)
- **Auto-Escalation** — Scheduled job every 5 minutes automatically escalates stale transactions (>30 min in FAILED/UNDER_REVIEW)
- **SMS Notifications** — Twilio-powered SMS alerts on escalation and resolution
- **Email Notifications** — Gmail SMTP HTML emails on escalation and resolution
- **Audit Trail** — Complete escalation log with timestamps for every status change
- **Dark Theme Dashboard** — Real-time summary cards, filterable transaction table, detail view with timeline

---

## Tech Stack

**Backend:** Java 17, Spring Boot 3.2.5, Spring MVC, Spring Data JPA, Spring Scheduler, Twilio SDK, JavaMailSender  
**Frontend:** React 18, Vite, Tailwind CSS 4, Axios, React Router  
**Database:** MySQL 8  
**Build:** Maven, npm

---

## Project Structure
TraceUPI/
├── backend/                  # Spring Boot (Java 17, Maven)
│   └── src/main/java/com/traceupi/
│       ├── config/           # CORS, Twilio initialization
│       ├── controller/       # REST endpoints
│       ├── dto/              # Request/Response DTOs
│       ├── enums/            # TransactionStatus, NotificationType
│       ├── exception/        # Custom exceptions + global handler
│       ├── model/            # JPA entities
│       ├── repository/       # Spring Data JPA repositories
│       ├── scheduler/        # Auto-escalation cron job
│       ├── service/          # Business logic layer
│       └── TraceUpiApplication.java
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── api/              # Axios API layer
│       ├── components/       # Sidebar, StatusBadge, SummaryCard, etc.
│       └── pages/            # Dashboard, Transactions, Detail, Notifications
├── schema.sql                # Database DDL
└── README.md

---

## Getting Started

### Prerequisites

- Java JDK 17+
- Maven 3.8+
- Node.js 18+ and npm 9+
- MySQL 8.0+

### Database Setup

```sql
CREATE DATABASE traceupi;
```

Hibernate will auto-create the tables on first boot (`ddl-auto=update`). The `schema.sql` file is there if you'd rather set up manually:

```bash
mysql -u root -p traceupi < schema.sql
```

### Backend Setup

Edit `backend/src/main/resources/application.properties` and fill in:

| Property | Description |
|----------|-------------|
| `spring.datasource.password` | Your MySQL root password |
| `twilio.account.sid` | Twilio Account SID |
| `twilio.auth.token` | Twilio Auth Token |
| `twilio.phone.from` | Twilio phone number (e.g. +1...) |
| `twilio.phone.to` | Admin phone to receive SMS |
| `spring.mail.username` | Gmail address |
| `spring.mail.password` | Gmail App Password |
| `admin.email` | Admin email to receive alerts |

Then run:

```bash
cd backend
mvn spring-boot:run
```

API server starts at **http://localhost:8080**.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App starts at **http://localhost:5173**.

---

## API Reference

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Create a new failed transaction |
| GET | `/api/transactions` | List all (optional `?status=`) |
| GET | `/api/transactions/{transactionId}` | Get single transaction |
| PUT | `/api/transactions/{transactionId}/status` | Update status (forward-only) |
| GET | `/api/transactions/{transactionId}/logs` | Escalation history |
| GET | `/api/transactions/{transactionId}/notifications` | Notifications for transaction |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | All notification logs |

### Examples

**Create a transaction:**
```bash
curl -X POST http://localhost:8080/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "UPI1234567890",
    "amount": 1500.00,
    "senderUpi": "user@paytm",
    "receiverUpi": "shop@ybl",
    "failureReason": "Bank Server Down"
  }'
```

**Update status:**
```bash
curl -X PUT http://localhost:8080/api/transactions/UPI1234567890/status \
  -H "Content-Type: application/json" \
  -d '{"status": "UNDER_REVIEW"}'
```

---

## State Machine
FAILED → UNDER_REVIEW → ESCALATED → RESOLVED → CLOSED

Only forward transitions are allowed. Backward transitions return HTTP 400. Duplicate transaction IDs return HTTP 409.

---

## Limitations

- No authentication layer yet — the API is open, so not production-ready as-is
- Twilio trial accounts can only send SMS to verified numbers
- Auto-escalation interval is hardcoded at 5 minutes; would make this configurable next