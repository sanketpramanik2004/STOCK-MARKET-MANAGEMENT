# Stock Market Management System

A full-stack stock trading and portfolio management platform built with Spring Boot, React, MySQL, Tailwind CSS, JWT authentication, Alpha Vantage market data, and OpenAI-powered analysis.

## Features

- User registration and login
- Google login support
- JWT-secured user and admin sessions
- Live stock list and stock detail pages
- Buy and sell shares with wallet balance checks
- Portfolio holdings with realized and unrealized profit/loss
- Wallet page with deposit, withdraw, and wallet history
- Transaction history with detail modal
- Watchlist management
- AI stock analysis
- AI portfolio analysis
- OpenAI-powered stock news section
- Admin dashboard
- Admin stock add, edit, delete, and price updates
- Admin user and transaction monitoring

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- React Router DOM
- Axios
- Recharts
- Framer Motion
- Webpack

**Backend**
- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- MySQL

**External Services**
- Alpha Vantage for stock quotes
- OpenAI for AI analysis and stock news
- Google OAuth for login

## Project Structure

```text
.
├── backend/
│   ├── src/main/java/com/stockmarket/backend/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   └── service/
│   └── src/main/resources/
└── frontend/
    ├── public/
    └── src/
        ├── assets/
        ├── components/
        ├── layouts/
        ├── pages/
        ├── routes/
        └── services/
```

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/sanketpramanik2004/STOCK-MARKET-MANAGEMENT.git
cd STOCK-MARKET-MANAGEMENT
```

### 2. Configure backend secrets

Create a local configuration file from the safe example:

```bash
cp backend/src/main/resources/application-local.example.properties backend/src/main/resources/application-local.properties
```

Then fill in your local values inside:

```text
backend/src/main/resources/application-local.properties
```

This file is ignored by Git, so your passwords and API keys stay local.

Required values:

- MySQL password
- Alpha Vantage API key
- OpenAI API key
- Google OAuth client ID
- Google OAuth client secret
- JWT secret

### 3. Create the MySQL database

```sql
CREATE DATABASE stock_management;
```

### 4. Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8080
```

### 5. Run the frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

## Important Security Note

Do not commit real passwords, API keys, OAuth secrets, or JWT secrets.

Use:

```text
backend/src/main/resources/application-local.properties
```

for local secrets. The committed `application.properties` only contains safe placeholders.

## Default Admin

The backend seeds an admin account for local demo use through `AdminSeeder`.

Check the seeded credentials in the backend source before demoing, and change them before any production deployment.

## Useful Commands

Run backend tests:

```bash
cd backend
./mvnw test
```

Build frontend:

```bash
cd frontend
npm run build
```

## API Overview

Main backend route groups:

- `/api/auth`
- `/api/stocks`
- `/api/user/stocks`
- `/api/trading`
- `/api/portfolio`
- `/api/transactions`
- `/api/wallet`
- `/api/watchlist`
- `/api/ai`
- `/api/admin`

## License

This project is for academic and demonstration purposes.
