# ReModule ERP Platform

A complete, full-stack, cloud-based business management platform designed for a wholesale clothing distribution company. The system simulates a real operating company with several years of realistic seeded data, monthly/yearly reports, interactive dashboards, inventory counts, warehouse zones, B2B customer pipelines, and live cloud infrastructure statuses.

## Features

1. **ERP Module**: Products catalog, B2B suppliers registry, sales & purchase orders processing, invoicing ledger, operational expenses tracker, and monthly/yearly financial profit & loss reports.
2. **CRM Module**: B2B customer listings, lead pipelines (stage funnel tracking), customer activity histories, and credit limit debt warnings.
3. **WMS Module**: Warehouse zones occupancy layout, automated low stock alerts, stock transfer movement forms, and log registries.
4. **Cloud Network Module**: Simulated AWS VPC topology map (containing VPN, Subnets, Firewalls, gateways, CDNs, NATs), line telemetry monitors, scaling logs, security alerts, and a manual load injection sim toggle.

---

## Default Admin Credentials

For easy local testing, log in with the following default administrator credentials:
* **Email**: `admin@remodule.com`
* **Password**: `Admin12345`

Other seeded accounts:
* **Manager**: `manager@remodule.com` / `Manager123`
* **Warehouse Staff**: `warehouse@remodule.com` / `Warehouse123`
* **Sales Staff**: `sales@remodule.com` / `Sales123`
* **Accountant**: `accountant@remodule.com` / `Accountant123`

---

## Technical Stack

* **Backend**: NestJS + TypeScript + Prisma ORM + SQLite
* **Frontend**: React + TypeScript + Vite + Tailwind CSS + Recharts
* **State & Authentication**: JWT + Role-based access control, Axios Client

---

## Installation & Running

Ensure you have [Node.js (v18 or higher)](https://nodejs.org) installed on your system.

### 1. Setup Backend Server

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations and seed the SQLite database:
   ```bash
   npx prisma migrate dev --name init
   ```
   *Note: This command generates the SQLite database file (`dev.db` under the `prisma` folder) and automatically executes `seed.ts` to insert 50+ clothing products, 30+ customers, 15+ suppliers, 100+ sales orders, 80+ purchase orders, invoices, payments, expenses, and cloud telemetry.*
4. Start the NestJS backend server:
   ```bash
   npm run start:dev
   ```
   *The backend will boot up on http://localhost:3001/api.*

### 2. Setup Frontend Application

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The React app will boot up on http://localhost:5173.*

4. Open [http://localhost:5173](http://localhost:5173) in your browser and sign in.
