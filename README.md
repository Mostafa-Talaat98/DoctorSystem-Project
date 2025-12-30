# Doctor Appointment System
//
A comprehensive web application for managing doctor appointments, featuring patient and doctor authentication, real-time chat, appointment scheduling, and review systems.

##  Features

*   **Authentication & Authorization**:
    *   Separate registration/login for Doctors and Patients.
    *   Support for Email/Password and Google OAuth.
    *   OTP verification for secure account activation.
    *   Secure session management with JWT and Cookies.
*   **Doctor Management**:
    *   Profile management with image upload.
    *   Search and filter doctors by name and specialty.
    *   "Like" system for favorite doctors.
*   **Appointment System**:
    *   Book, Reschedule, and Cancel appointments.
    *   Booking confirmation and status tracking.
*   **Real-time Chat**:
    *   Instant messaging between patients and doctors using `Socket.io`.
    *   View chat history.
*   **Reviews & Ratings**:
    *   Patients can rate and review doctors.
    *   View all reviews for a specific doctor.
*   **Security**:
    *   Data encryption (bcrypt).
    *   Rate limiting to prevent abuse.
    *   Secure HTTP headers (Helmet).
    *   Input validation (Joi).

## 🛠️ Tech Stack

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (with Mongoose ODM)
*   **Real-time Communication**: Socket.io

### Tools & Libraries
*   **Authentication**: JSON Web Token (JWT), Google Auth Library
*   **Security**: Helmet, CORS, Express Rate Limit, BcryptJS
*   **File Upload**: Multer, Cloudinary
*   **Validation**: Joi
*   **Notifications**: Nodemailer (Email), Twilio (SMS)

## 📂 Folder Structure

```
doctor-project/
├── DB/                 # Database models and connection
├── middleware/         # Custom Express middleware (Auth, Validation)
├── modules/            # Feature-based architecture
│   ├── auth/           # Authentication (Doctor/Patient)
│   ├── booking/        # Appointment booking logic
│   ├── chats/          # Chat functionality
│   ├── review/         # Review system
│   └── users/          # User/Doctor management
├── utils/              # Utility functions (Error handling, Multer, etc.)
├── app.controller.js   # Main application controller
├── index.js            # Entry point
└── .env                # Environment variables
```

## ⚙️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd doctor-project
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory based on `.env.example`. Add your credentials:
    ```env
    PORT=4000
    DB=<Your_MongoDB_URI>
    
    # JWT Secrets
    TOKEN_SIGNATURE=<Your_Secret>
    
    # Google Auth
    CLIENT_ID=<Google_Client_ID>
    
    # Cloudinary
    cloud_name=<Your_Cloud_Name>
    api_key=<Your_Api_Key>
    api_secret=<Your_Api_Secret>
    
    # Email (Nodemailer)
    EMAIL=<Your_Email>
    EMAIL_PASSWORD=<Your_App_Password>
    ```

4.  **Run the application**
    *   Development mode:
        ```bash
        npm run dev
        ```
    *   Production mode:
        ```bash
        npm start
        ```

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/doctor/register` | Register a new doctor |
| POST | `/doctor/google/register` | Register doctor via Google |
| POST | `/patient/register` | Register a new patient |
| POST | `/patient/google/register` | Register patient via Google |
| POST | `/login` | Login (Doctor/Patient) |
| POST | `/google/login` | Login via Google |
| POST | `/verify-account` | Verify account via OTP |
| POST | `/re-send-otp` | Resend verification OTP |
| GET | `/refresh` | Refresh access token |

### Users/Doctors (`/api/user`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/doctors` | Get all doctors |
| GET | `/doctors/specialty` | Filter doctors by specialty |
| GET | `/doctors/name` | Search doctors by name |
| GET | `/doctor/:id` | Get specific doctor details |
| PATCH | `/upload-profile-picture` | Upload profile image |
| PATCH | `/:id/like` | Like/Unlike a doctor |

### Booking (`/api/booking`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/` | Create a new booking |
| GET | `/doctor/:doctorId` | Get bookings for a doctor |
| GET | `/:bookingId` | Get booking details |
| PATCH | `/:bookingId` | Update booking |
| PATCH | `/confirm/:bookingId` | Confirm appointment |
| PATCH | `/reschedule/:bookingId` | Reschedule appointment |
| PATCH | `/cancel/:bookingId` | Cancel appointment |
| DELETE | `/:bookingId` | Delete booking record |

### Chat (`/api/chat`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/my-chats` | Get current user's chat list |
| GET | `/:userId` | Get messages with a specific user |

### Reviews (`/api/reviews`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/` | Add a review (Patients only) |
| GET | `/:doctorId` | Get reviews for a doctor |

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request