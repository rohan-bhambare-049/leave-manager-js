# Online Free Leave Manager

A small Employee Leave Management app that I built for demo purpose.

The backend is a REST API made with **Node.js + Express** and it stores the data in **PostgreSQL**.
On my laptop it talks to a local PostgreSQL, and when I deploy it on **Vercel** the same code talks to a
**Neon** PostgreSQL database. Both are PostgreSQL, so I only change the `DATABASE_URL` value in the env file.

---

## Folder structure

```
online-free-leave-manager/
├── backend/
│   ├── api/index.js                # entry point used by Vercel
│   ├── db/schema.sql               # tables
│   ├── scripts/migrate.js          # creates the tables
│   ├── scripts/seed.js             # adds one HR and one employee
│   ├── src/
│   │   ├── app.js                  # express app
│   │   ├── server.js               # starts the server locally
│   │   ├── config/db.js            # postgres / neon connection
│   │   ├── routes/                 # url definitions
│   │   ├── controllers/            # read request, send response
│   │   ├── services/               # business rules
│   │   ├── models/                 # sql queries only
│   │   ├── middleware/             # jwt auth and error handling
│   │   └── utils/                  # validation helpers
│   └── tests/                      # jest + supertest tests
├── frontend/
│   └── src/                        # react app
└── postman_collection.json
```

---

## 1. Setup the database

### Local PostgreSQL

```bash
createdb leave_manager
# or inside psql:  CREATE DATABASE leave_manager;
```

Then in `backend/.env` use:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/leave_manager
DATABASE_SSL=false
```

### Neon used for the Vercel deployment

```
DATABASE_URL=postgresql://<user>:<password>@ep-xxxx.aws.neon.tech/neondb?sslmode=require
DATABASE_SSL=true
```

Nothing more changes as Neon is PostgreSQL.

---

## 2. Run the backend

```bash
cd backend
cp .env.example .env      # then open .env and fill your values
npm install
npm run migrate           # creates the two tables
npm run seed              # optional, adds one HR and one employee
npm run dev               # or: npm start
```

The API now runs on `http://localhost:4000`.

### Environment variables

| Variable | Example | What it is for |
| --- | --- | --- |
| `PORT` | `4000` | Port of the API |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/leave_manager` | Postgres or Neon connection string |
| `DATABASE_SSL` | `false` locally, `true` on Neon | Neon needs SSL |
| `JWT_SECRET` | any long random text | Used to sign the login token |
| `JWT_EXPIRES_IN` | `1d` | Token validity |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

---

## 3. Run the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend has five simple tabs: Add Employee, Apply For Leave,
All Leave Requests, Leave Summary and HR Login.

---

## 4. Run the tests

```bash
cd backend
npm test
```

The tests use **Jest** and **Supertest**. The database module is mocked, so the tests run without a
real PostgreSQL running. They check the important things:

* creating an employee returns `201` and never returns the password hash
* missing name or a broken email returns `400`
* duplicate email returns `409`
* leave request with `to_date` before `from_date` returns `400`
* leave for an employee who does not exist returns `404`
* overlapping leave dates return `409`
* the `employee_id` and `status` filters really reach the SQL query
* approving without a token returns `401`, and with an employee token returns `403`
* HR approving a pending request returns `200`
* approving a request that is already approved returns `409`
* the summary adds up the approved days correctly per leave type
* login returns a token with the right password and `401` with a wrong one

---

## API endpoints

| Method | Endpoint | Who can call it | What it does |
| --- | --- | --- | --- |
| POST | `/employees` | anyone | create an employee |
| GET | `/employees` | anyone | list employees (used by the frontend dropdowns) |
| GET | `/employees/:id` | anyone | get one employee |
| POST | `/auth/login` | anyone | login and get a JWT token |
| GET | `/auth/me` | logged in | who am I |
| POST | `/leaves` | anyone | submit a leave request |
| GET | `/leaves?employee_id=&status=` | anyone | list leave requests with filters |
| PATCH | `/leaves/:id/status` | HR only | approve or reject |
| GET | `/leaves/summary/:employee_id` | anyone | total approved leaves by type |

Allowed leave types: `casual`, `sick`, `earned`, `unpaid`.
Allowed statuses: `pending`, `approved`, `rejected`.

### Status codes used

`200` ok, `201` created, `400` bad input, `401` no or bad token, `403` wrong role,
`404` not found, `409` duplicate email / duplicate dates / already decided, `500` server error.

---

## Sample requests (curl)

Create an employee:

```bash
curl -X POST http://localhost:4000/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"Rohan Roy","department":"Engineering","email":"rohan@company.com","password":"emp12345"}'
```

Submit a leave request:

```bash
curl -X POST http://localhost:4000/leaves \
  -H "Content-Type: application/json" \
  -d '{"employee_id":1,"leave_type":"casual","from_date":"2026-09-10","to_date":"2026-09-12","reason":"Family function"}'
```

List leave requests with filters:

```bash
curl "http://localhost:4000/leaves?employee_id=1&status=pending"
```

Login as HR and copy the token:

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@company.com","password":"hr12345"}'
```

Approve a leave request (HR token needed):

```bash
curl -X PATCH http://localhost:4000/leaves/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASTE_TOKEN_HERE" \
  -d '{"status":"approved"}'
```

Leave summary of one employee:

```bash
curl http://localhost:4000/leaves/summary/1
```

Sample summary response:

```json
{
  "employee_id": 1,
  "employee_name": "Rohan",
  "total_days": 7,
  "by_type": {
    "casual": { "total_requests": 2, "total_days": 5 },
    "sick": { "total_requests": 1, "total_days": 2 }
  }
}
```
