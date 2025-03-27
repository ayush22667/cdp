# Claims Management System

## Project Overview

A comprehensive insurance policy and claims management application with separate user and admin interfaces. Users can purchase policies, file claims, and track their status, while administrators can manage policies, process claims, and handle policy requests.

## Project Structure

```
cdp/
├── Backend/                     # Node.js/Express backend
├── claims-management-frontend/ # React frontend
├── docker-compose.yml           # Multi-service setup
├── run-with-env.sh              # One-command env setup script
├── .env.backend                 # Auto-created by script
├── .env.frontend                # Auto-created by script
```

## Features

### User Features
- Register, login, and manage profile
- Browse and purchase insurance policies
- File and track insurance claims
- View policy and claim history

### Admin Features
- Dashboard with charts and statistics
- Manage policies and users
- Process claims (approve/reject)
- Handle policy purchase requests

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- SendGrid + Mautic for emails
- Swagger API docs
- Google Gemini AI (chatbot)
- Cron jobs, rate limiting

### Frontend
- React 19 + Tailwind CSS
- React Router, Axios
- Chart.js, React Hot Toast
- React DnD for drag-and-drop

## Prerequisites

Ensure you have:
- Node.js (v16 or higher)
- npm (v7 or higher)
- Docker
- Git

## Quick Start (Recommended with Docker)

### Step 1: Clone the repository

```bash
git clone https://github.com/ayush22667/cdp.git
cd cdp
```

### Step 2: Create Setup Script

Create a script to generate environment files and start the application:

```bash
cat > run-with-env.sh <<'EOL'
#!/bin/bash
echo "Setting up environment variables..."
# Backend .env
cat > .env.backend <<EOF
PORT=4000
DATABASE_URL=mongodb+srv://ayushanandbtcs:OGUCgq79U9cdkqbp@claimmanagement.wavj4.mongodb.net/test?retryWrites=true&w=majority&appName=ClaimManagement
JWT_SECRET=ayushanand
ADMIN_SECRET_KEY=supersecureadminkey
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_SENDER=ayushanandbtcs@gmail.com
FRONTEND_URL=https://claim-management-system-1-5pzo.onrender.com
relic=your-new-relic-key
LICENSE_KEY=feec9d620f9bd8297c22a278d9529851FFFFNRAL
CORS_ORIGIN=https://claim-management-system-1-5pzo.onrender.com,http://localhost:3000,http://10.123.215.101:8181
GEMINI_API_KEY=your-gemini-key
MAUTIC_BASE_URL=http://localhost:8080
MAUTIC_USER=admin
MAUTIC_PASS=123@Ayush
WIT_AI_SERVER_ACCESS_TOKEN=2JGN4WXFPWKIYVW6NEFF7JAS2MDYIC7Z
UNOMI_API_URL=http://localhost:8181
UNOMI_AUTH=a2FyYWY6a2FyYWY=
BACKEND_URL=http://localhost:4000
UNOMI_USER=karaf
UNOMI_PASS=karaf
EOF
# Frontend .env
cat > .env.frontend <<EOF
REACT_APP_UNOMI_API_URL=http://localhost:8181
EOF
echo "Environment files created."
echo "Starting containers with Docker Compose..."
docker-compose up --build
EOL
# Make script executable
chmod +x run-with-env.sh
```

### Step 3: Run the Setup Script

```bash
./run-with-env.sh
```

This script will:
- Create `.env.backend` with all necessary backend environment variables
- Create `.env.frontend` with frontend environment variables
- Make the script executable
- Start the Docker Compose setup

## Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Mautic: http://localhost:8080
- Mailhog: http://localhost:8025
- Unomi: http://localhost:8181
- Swagger Docs: http://localhost:4000/api-docs

## Manual Setup (Without Docker)

### Backend

```bash
cd Backend
npm install
# Create .env manually or run setup script
npm run dev
```

### Frontend

```bash
cd claims-management-frontend
npm install
npm start
```

## API Documentation

Once the backend is running, access API docs at:
```
http://localhost:4000/api-docs
```

## Database Collections

- Users
- Policies
- PurchasedPolicies
- Claims
- PolicyRequests


Update environment variables accordingly.

## Contributing

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Submit a Pull Request

## Environment Variables

The script generates two key environment files:

### Backend Environment Variables (.env.backend)
- `PORT`: Application port
- `DATABASE_URL`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT authentication
- `ADMIN_SECRET_KEY`: Admin access key
- `SENDGRID_API_KEY`: SendGrid email service key
- `FRONTEND_URL`: Frontend application URL
- `GEMINI_API_KEY`: Google Gemini API key
- `MAUTIC_BASE_URL`: Mautic integration URL
- `UNOMI_API_URL`: Apache Unomi API URL

### Frontend Environment Variables (.env.frontend)
- `REACT_APP_UNOMI_API_URL`: Unomi API URL for frontend

## Security Notice

- Never commit real API keys or secrets to the repository
- Use environment variables and secret managers in production
- Rotate secrets regularly
- Limit access to environment files

## Credits

Created by Ayush Anand. Integrated with Mautic, Apache Unomi, and Google Gemini for personalized marketing and smart automation.
