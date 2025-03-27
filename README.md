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
DATABASE_URL=mongodb://mongo:27017/claimmanagement
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=your_admin_secret
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER=your_email@example.com
FRONTEND_URL=http://localhost:3000
relic=your_new_relic_key
LICENSE_KEY=your_license_key
CORS_ORIGIN=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
MAUTIC_BASE_URL=http://localhost:8080
MAUTIC_USER=admin
MAUTIC_PASS=123@Ayush
WIT_AI_SERVER_ACCESS_TOKEN=your_wit_ai_token
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

### Step 2B: Setup API Keys

Before running the setup script, you'll need to obtain and configure the following API keys:

1. **SendGrid API Key**
   - Visit [SendGrid](https://sendgrid.com/) and create an account
   - Go to Settings > API Keys
   - Create a new API key with appropriate permissions
   - Replace `your-sendgrid-api-key` in the script with your actual SendGrid API key

2. **Google Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key for the Gemini API
   - Replace `your-gemini-key` in the script with your actual Gemini API key

3. **New Relic License Key**
   - Sign up at [New Relic](https://newrelic.com/)
   - Navigate to Account Settings
   - Find or generate your license key
   - Replace `your-new-relic-key` in the script with your actual New Relic license key

### Step 3: Run the Setup Script

```bash
./run-with-env.sh
```

This script will:
- Create `.env.backend` with all necessary backend environment variables
- Create `.env.frontend` with frontend environment variables
- Make the script executable
- Start the Docker Compose setup

**Note:** Ensure you replace the placeholder keys with your actual API keys to enable full functionality of the application.

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

## Deployment

### Backend
- Render, Heroku, EC2

### Frontend
- Netlify, Vercel

### Database
- MongoDB Atlas

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

