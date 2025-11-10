# Mediverse - Hospital Management System (HMS)

A full-stack, enterprise-grade Hospital Management System built with React, Node.js, Express, and PostgreSQL.

## 🏗️ Architecture

- **Frontend**: React + Vite + TypeScript
- **UI**: TailwindCSS + ShadCN/UI + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **State Management**: TanStack Query (React Query)

## 🚀 Features

### Role-Based Dashboards
- **Admin Dashboard**: Complete hospital overview, analytics, and management
- **Doctor Dashboard**: Patient management, prescriptions, lab tests, treatments
- **Nurse Dashboard**: Patient care, medication tracking, vital logs
- **Chemist Dashboard**: Prescription management, inventory, stock tracking
- **Attendant Dashboard**: Patient registration, room assignment, billing
- **Lab Technician Dashboard**: Lab test management, report uploads
- **Patient Dashboard**: Health records, appointments, prescriptions, lab results

### Core Modules
- ✅ Patient Management (Registration, Demographics, Medical History)
- ✅ Doctor & Staff Management
- ✅ Room & Accommodation Management
- ✅ Treatment & Healthcare Records
- ✅ Prescription Management
- ✅ Lab Reports & Test Management
- ✅ Billing & Charges
- ✅ Real-time Updates via Socket.IO
- ✅ Analytics & Reporting

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd mediverse-stack
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/mediverse?schema=public"

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# From root directory
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📁 Project Structure

```
mediverse-stack/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── lib/          # Utilities (Prisma client)
│   │   ├── utils/        # Helper functions
│   │   └── index.ts      # Express server
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── src/
│   ├── pages/           # Page components
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts (RoleContext)
│   ├── lib/            # API client, utilities
│   └── App.tsx
└── package.json
```

## 🗄️ Database Schema

The system implements a comprehensive ER diagram with:

- **Entities**: Patient, Doctor, Nurse, Chemist, Room, Bill, LabReport, Treatment, Accommodation
- **Relationships**: 1:1, 1:M, M:N mappings between entities
- **Associative Entities**: Healthcare, Examine, Decide, Charges, Prescription

See `backend/prisma/schema.prisma` for the complete schema.

## 🔌 API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/:id/patients` - Get doctor's patients
- `POST /api/doctors` - Create doctor

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription

### Lab Reports
- `GET /api/lab-reports` - Get all lab reports
- `GET /api/lab-reports/pending/all` - Get pending tests
- `POST /api/lab-reports` - Create lab test request
- `PUT /api/lab-reports/:id` - Update lab report

### And many more...

## 🔄 Real-time Updates

The system uses Socket.IO for real-time updates:
- Patient status changes
- Prescription updates
- Lab report completions
- Room assignments
- Bill updates

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 🐳 Docker Deployment

```bash
# Build backend image
cd backend
docker build -t mediverse-backend .

# Run with docker-compose (if available)
docker-compose up
```

## 📊 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/mediverse
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🎨 UI Features

- **Role Switcher**: Dynamic role switching in header navbar
- **Animated Transitions**: Framer Motion for smooth role changes
- **Responsive Design**: Mobile-first, works on all devices
- **Modern UI**: ShadCN/UI components with TailwindCSS

## 📝 License

MIT License

## 👥 Contributors

Built for SIES Hackathon 2025

---

**Note**: This is a comprehensive HMS system. Make sure PostgreSQL is running and properly configured before starting the backend server.
