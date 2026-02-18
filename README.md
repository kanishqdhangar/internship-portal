# Internship Portal – Full Stack Application

A production-ready, secure, full-stack Internship Management Platform built using React and Django REST Framework.

This platform enables students to apply for internships, upload documents, track application status, and receive automated email notifications — while providing mentors and administrators with a secure system to manage applications efficiently.

Designed with real-world architecture principles, authentication security, and deployment considerations in mind.

---

## 🌐 Live Demo

- **Frontend**: https://internship-portal-woad.vercel.app/
- **Backend API**: https://internship-portal-0gvj.onrender.com

---

## Live Architecture Overview

Frontend:
- React 
- Axios (API integration)
- Tailwind CSS (UI styling)
- Google reCAPTCHA v2 (Bot protection)

Backend:
- Django
- Django REST Framework
- JWT Authentication (HttpOnly cookies)
- Secure role-based access control
- Google Apps Script (Email automation)

Security:
- reCAPTCHA validation (frontend + backend verification)
- JWT stored in HttpOnly cookies
- Input validation and file restrictions
- Environment variable configuration
- CORS protection

Deployment:
- Frontend deployed on Vercel 
- Backend configured for production deployment
- Environment-based configuration

---

## Core Features

### Student Features
- Secure Registration with OTP Verification
- Login with Google reCAPTCHA validation
- Apply to internships
- Upload Resume and ID Card (PDF only, max 10MB)
- View personal application status
- Automatic email confirmation on submission
- Automatic email notification on status updates

### Mentor Features
- Role-based login (User / Staff )
- View and manage all student applications
- Update application status (Selected / Rejected / Applied)
- Trigger automated email notifications on status changes

---

## Advanced Functionalities Implemented

- RESTful API architecture using Django REST Framework
- Custom authentication flow using JWT + HttpOnly cookies
- Google reCAPTCHA verification on backend for bot prevention
- Secure file upload validation (type and size restrictions)
- Google Apps Script integration for email automation
- OTP verification system for account validation
- Protected routes and role-based navigation
- Dynamic filtering and search functionality
- Production-ready environment configuration

---

## Authentication Flow

1. User submits login form with reCAPTCHA token
2. Backend verifies token with Google API
3. If valid, JWT tokens are generated
4. Tokens stored in HttpOnly cookies
5. `/auth/me/` endpoint verifies authenticated user
6. Role-based redirection applied

This ensures:
- Secure authentication
- XSS protection (HttpOnly cookies)
- Backend token validation
- No sensitive data stored in localStorage

---

# Backend Setup (Django)

## 1. Clone Repository

```bash
git clone https://github.com/your-repository-link.git
cd backend/mnit/internship_portal
```

## 2. Create Virtual Environment

```bash
python -m venv mnit
mnit\Scripts\activate
```

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## 4. Create .env File

```env
SECRET_KEY=your_django_secret_key
DEBUG=True
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
GAS_EMAIL_URL=your_google_apps_script_url
GAS_SECRET=your_google_apps_script_secret
```

## 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

## 6. Run Server

```bash
python manage.py runserver
```

Backend runs at:
http://localhost:8000

---

# Frontend Setup (React)

## 1. Navigate to Frontend

```bash
cd frontend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create .env File

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## 4. Run Development Server

```bash
npm run dev
```

Frontend runs at:
http://localhost:5173

---

# Google reCAPTCHA Setup

1. Visit https://www.google.com/recaptcha/admin/create
2. Select reCAPTCHA v2 (Checkbox)
3. Add domains:
   - localhost
   - 127.0.0.1
   - your-vercel-domain.vercel.app
4. Copy:
   - Site Key → frontend
   - Secret Key → backend

Ensure both keys belong to the same project.

---

# Email Automation (Google Apps Script)

Email notifications are triggered on:

- Successful internship application
- Application status update
- OTP verification

Google Apps Script is deployed as a web app and called securely from the backend.

---

# Production Considerations Implemented

- Environment-based configuration
- Secure cookie settings
- reCAPTCHA server-side verification
- Clean separation of frontend and backend
- Error handling and validation across layers
- Role-based navigation logic
- Clean modular app structure

---

# Technical Skills Demonstrated

- Full-stack development (React + Django)
- REST API design and implementation
- JWT authentication and cookie management
- Secure third-party API integration
- Production-ready configuration management
- Role-based access control
- File upload handling
- Email automation systems
- Secure authentication architecture
- Frontend state management and UX handling

---

# Future Enhancements

- Async email processing with Celery
- Resume preview integration
- Admin analytics dashboard
- Advanced filtering and sorting
- Password reset workflow
- CI/CD integration

---

# Author

Kanishq 