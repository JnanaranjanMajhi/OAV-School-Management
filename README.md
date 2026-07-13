<div align="center">

# 🏫 OAV School Management System

### A Modern Full-Stack Digital School Management Platform

A secure, responsive, and feature-rich school management application designed to simplify academic administration, student management, communication, and access to school-related information.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Website-00C7B7?style=for-the-badge\&logo=vercel\&logoColor=white)](https://oav-school.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github)](https://github.com/JnanaranjanMajhi/OAV-School-Management)

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square\&logo=react\&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square\&logo=vite\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square\&logo=node.js\&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.2-000000?style=flat-square\&logo=express\&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square\&logo=mongodb\&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square\&logo=javascript\&logoColor=black)

</div>

---

## 📖 About the Project

The **OAV School Management System** is a full-stack web application developed to provide a centralized digital platform for managing school-related activities and information.

The platform is designed to improve communication, simplify administrative work, organize academic information, and provide students, teachers, and administrators with convenient access to important school services.

The application combines a modern and responsive frontend with a secure and scalable backend architecture.

---

## 🌐 Live Application

The deployed application is available at:

### 🔗 https://oav-school.vercel.app

---

## ✨ Key Features

### 👨‍🎓 Student Management

* Maintain organized student information
* View student details and academic information
* Manage class-wise student records
* Search and access student data
* Maintain centralized student records

### 👨‍🏫 Teacher Management

* Maintain teacher information
* View teacher profiles
* Organize faculty-related information
* Manage academic responsibilities

### 🏫 School Information

* Display important information about the school
* Provide easy access to academic resources
* Maintain school-related information on a centralized platform
* Improve communication between the school and students

### 📚 Academic Management

* Organize classes and subjects
* Maintain academic information
* Manage class-wise educational content
* Provide students with access to relevant academic details

### 📢 Notices and Announcements

* Publish important school notices
* Display announcements and updates
* Keep students informed about school activities
* Improve communication between school administrators and users

### 📄 PDF Report Generation

* Generate downloadable PDF documents
* Create organized reports
* Export information in a convenient format
* Generate structured tables inside PDF files

### 📊 Excel Data Support

* Process spreadsheet information
* Import and manage Excel-based records
* Simplify bulk data management

### 🔐 Secure Authentication

* User registration and login
* JSON Web Token authentication
* Secure password encryption
* Protected application routes
* Cookie-based authentication support
* Google OAuth authentication

### ☁️ Cloud Media Management

* Upload and manage media files
* Cloud-based image storage using Cloudinary
* Optimized storage and delivery of uploaded content

### 📧 Email Communication

* Email delivery support
* Account-related email communication
* Email notification capabilities
* Integration with Resend and Nodemailer

### 📱 SMS Communication

* Twilio integration
* Support for SMS-based communication and notifications

### 🗺️ Google Maps Integration

* Interactive Google Maps support
* Display school location information
* Improve accessibility for visitors

### 📱 Responsive User Interface

* Mobile-friendly design
* Responsive desktop and tablet layouts
* Modern navigation experience
* Smooth animations and page transitions
* Interactive notifications

---

## 🛠️ Technology Stack

### Frontend

| Technology      | Purpose                             |
| --------------- | ----------------------------------- |
| React 19        | Component-based user interface      |
| Vite            | Frontend development and build tool |
| JavaScript      | Application functionality           |
| CSS             | Styling and responsive design       |
| React Router    | Client-side routing                 |
| Axios           | API communication                   |
| Framer Motion   | Animations and transitions          |
| Lucide React    | Modern application icons            |
| React Hot Toast | Interactive notifications           |
| Google OAuth    | Google authentication               |
| Google Maps API | Interactive map integration         |
| jsPDF           | PDF document generation             |
| jsPDF AutoTable | Structured PDF tables               |

### Backend

| Technology          | Purpose                            |
| ------------------- | ---------------------------------- |
| Node.js             | Server-side JavaScript runtime     |
| Express.js          | Backend web framework              |
| MongoDB             | NoSQL database                     |
| Mongoose            | MongoDB object data modelling      |
| JSON Web Token      | Secure user authentication         |
| bcrypt.js           | Password encryption                |
| Google Auth Library | Google authentication verification |
| Cloudinary          | Cloud media management             |
| Multer              | File upload handling               |
| Nodemailer          | Email delivery                     |
| Resend              | Transactional email service        |
| Twilio              | SMS communication                  |
| XLSX                | Excel file processing              |

### Security and Validation

| Technology         | Purpose                                   |
| ------------------ | ----------------------------------------- |
| Helmet             | Secure HTTP response headers              |
| Express Rate Limit | Protection against excessive API requests |
| Express Validator  | Server-side request validation            |
| CORS               | Cross-origin resource sharing             |
| Cookie Parser      | Secure cookie management                  |
| Morgan             | HTTP request logging                      |
| dotenv             | Environment-variable management           |

---

## 📂 Project Structure

```text
OAV-School-Management/
│
├── client/                         # React frontend application
│   │
│   ├── public/                     # Public assets
│   │
│   ├── src/                        # Frontend source code
│   │   ├── assets/                 # Images and application assets
│   │   ├── components/             # Reusable React components
│   │   ├── pages/                  # Application pages
│   │   ├── services/               # API-related services
│   │   ├── App.jsx                 # Main React component
│   │   └── main.jsx                # Frontend entry point
│   │
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite configuration
│
├── server/                         # Node.js backend application
│   │
│   ├── config/                     # Application configurations
│   ├── controllers/                # API controller functions
│   ├── middleware/                 # Authentication and middleware
│   ├── models/                     # MongoDB database models
│   ├── routes/                     # Backend API routes
│   ├── server.js                   # Backend entry point
│   ├── seed.js                     # Database seed script
│   └── package.json                # Backend dependencies
│
├── media/                          # Project media and screenshots
│
├── .gitignore                      # Git ignored files
│
└── README.md                       # Project documentation
```

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Install the following software before running the project:

* [Node.js](https://nodejs.org/)
* [npm](https://www.npmjs.com/)
* [Git](https://git-scm.com/)
* A MongoDB database or [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## 1️⃣ Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/JnanaranjanMajhi/OAV-School-Management.git
```

Navigate to the project folder:

```bash
cd OAV-School-Management
```

---

## 2️⃣ Frontend Installation

Navigate to the frontend directory:

```bash
cd client
```

Install the required packages:

```bash
npm install
```

Create a `.env` file inside the `client` folder:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 3️⃣ Backend Installation

Open another terminal and navigate to the server directory:

```bash
cd server
```

Install the backend dependencies:

```bash
npm install
```

---

## 4️⃣ Environment Configuration

Create a `.env` file inside the `server` folder.

Add the required environment variables according to your project configuration:

```env
# Server Configuration

PORT=5000
NODE_ENV=development


# Database Configuration

MONGODB_URI=your_mongodb_connection_string


# Authentication

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=7d


# Frontend URL

CLIENT_URL=http://localhost:5173


# Google Authentication

GOOGLE_CLIENT_ID=your_google_client_id


# Cloudinary Configuration

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret


# Email Configuration

RESEND_API_KEY=your_resend_api_key

EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_application_password


# Twilio Configuration

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

> The exact environment-variable names should match the names used inside the source code.

> Never upload your `.env` files, passwords, API keys, database credentials, or authentication secrets to GitHub.

---

## 5️⃣ Start the Backend Server

Run the backend in development mode:

```bash
npm run dev
```

Alternatively, run the production server:

```bash
npm start
```

The backend server will normally run at:

```text
http://localhost:5000
```

---

## 📜 Available Scripts

### Frontend Scripts

Run the frontend development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Check the frontend code using ESLint:

```bash
npm run lint
```

Preview the production build:

```bash
npm run preview
```

### Backend Scripts

Start the production server:

```bash
npm start
```

Start the backend with automatic development reload:

```bash
npm run dev
```

Seed the database:

```bash
npm run seed
```

---

## 🔒 Security Features

The application implements several backend security measures:

* Secure password hashing using bcrypt.js
* JSON Web Token authentication
* Protected API endpoints
* HTTP security headers using Helmet
* API rate limiting
* Server-side input validation
* Cross-Origin Resource Sharing configuration
* Environment-based secret management
* Secure cookie parsing
* Google authentication verification

---

## 🌍 Deployment

The application can be deployed using the following services:

### Frontend

* Vercel

### Backend

* Render
* Railway
* Other Node.js-compatible hosting platforms

### Database

* MongoDB Atlas

### Media Storage

* Cloudinary

---

## 🔮 Future Enhancements

Potential improvements for future versions include:

* Online student admission
* Automated attendance management
* Examination and result management
* Online assignment submission
* Parent dashboard
* Student performance analytics
* Interactive academic reports
* Online fee management
* Library management
* School transport tracking
* Class timetable management
* Real-time notifications
* Mobile application support
* AI-powered student assistance

---

## 🤝 Contributing

Contributions, feature suggestions, and improvements are welcome.

Follow these steps to contribute:

1. Fork the repository.

2. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Add your changes:

```bash
git add .
```

4. Commit your changes:

```bash
git commit -m "Add new feature"
```

5. Push your branch:

```bash
git push origin feature/your-feature-name
```

6. Open a pull request.

---

## 👨‍💻 Developer

<div align="center">

### Jnanaranjan Majhi

**B.Tech in Computer Science and Information Technology**

[![GitHub](https://img.shields.io/badge/GitHub-JnanaranjanMajhi-181717?style=for-the-badge\&logo=github)](https://github.com/JnanaranjanMajhi)

</div>

---

## 📄 License

This project is developed for educational and school-management purposes.

If you want others to use, modify, and contribute to the project, you can add an MIT License.

---

## ⭐ Support the Project

If you find this project useful:

* Give the repository a ⭐
* Share the project
* Suggest new features
* Report issues
* Contribute improvements

---

<div align="center">

### ⭐ Star this repository if you found it useful!

Developed with ❤️ by **Jnanaranjan Majhi**

</div>
