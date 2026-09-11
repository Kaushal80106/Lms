# LMS (Learning Management System)

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for managing online courses, student enrollments, and payments.

## 🔗 Links

- **Live Demo / Frontend:** [https://edemy-lms-frontend-jet.vercel.app/](https://edemy-lms-frontend-jet.vercel.app/)
- **Backend / API:** [https://edemy-api-weld.vercel.app/](https://edemy-api-weld.vercel.app/)
- **GitHub Repository:** [https://github.com/Kaushal80106/Lms](https://github.com/Kaushal80106/Lms)

## 🚀 Features

- **User Management**: Student and educator roles with Clerk authentication
- **Course Management**: Create, edit, and publish courses with rich content
- **Payment Integration**: Stripe payment gateway for course purchases
- **Progress Tracking**: Monitor student progress through courses
- **Image Upload**: Cloudinary integration for course thumbnails
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **Clerk** for authentication and user management
- **Stripe** for payment processing
- **Cloudinary** for image uploads
- **Multer** for file handling

### Frontend
- **React 19** with modern hooks
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Toastify** for notifications

## 📁 Project Structure

```
Lms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context for state management
│   │   ├── pages/         # Page components
│   │   └── assets/        # Images and static files
│   └── package.json
├── server/                 # Node.js backend
│   ├── configs/           # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   └── server.js          # Main server file
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Clerk account for authentication
- Stripe account for payments
- Cloudinary account for image uploads (optional)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Lms/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Required
   MONGODB_URI=mongodb://localhost:27017
   CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   
   # Optional (Cloudinary features disabled if missing)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CURRENCY=usd
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the server**
   ```bash
   npm run server  # Development with nodemon
   # or
   npm start       # Production
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the backend URL:
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   VITE_CURRENCY=USD
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `CLERK_WEBHOOK_SECRET` | ✅ | Clerk webhook verification secret |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key for payments |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe webhook verification secret |
| `CLOUDINARY_CLOUD_NAME` | ❌ | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | ❌ | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ❌ | Cloudinary API secret |
| `CURRENCY` | ❌ | Payment currency (default: USD) |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | Environment (default: development) |

### Frontend (.env)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_BACKEND_URL` | ✅ | Backend API URL |
| `VITE_CURRENCY` | ❌ | Display currency (default: USD) |

## 🗄️ Database Models

### User
- Basic user information (name, email, image)
- Role-based access (student/educator)
- Enrolled courses tracking

### Course
- Course metadata (title, description, price)
- Chapter and lecture structure
- Student enrollment tracking
- Rating system

### Purchase
- Payment transaction records
- Status tracking (pending/completed/failed)
- Stripe integration data

### CourseProgress
- Student progress tracking
- Completed lectures tracking
- Performance analytics

## 🔐 Authentication & Authorization

- **Clerk Integration**: Handles user registration, login, and session management
- **Role-Based Access**: Educators can create courses, students can enroll
- **Protected Routes**: Middleware ensures proper access control
- **Webhook Security**: Verifies webhook signatures for data integrity

## 💳 Payment Flow

1. **Course Selection**: Student selects a course to purchase
2. **Purchase Creation**: Backend creates a purchase record
3. **Stripe Session**: Redirects to Stripe checkout
4. **Payment Processing**: Stripe handles payment securely
5. **Webhook Handling**: Backend processes successful payments
6. **Enrollment**: Student is automatically enrolled in the course
7. **Database Update**: Purchase status and enrollment records updated

## 🚨 Error Handling

- **Graceful Degradation**: Cloudinary features disabled if env vars missing
- **Comprehensive Logging**: Detailed error logs for debugging
- **User-Friendly Messages**: Clear error messages for end users
- **HTTP Status Codes**: Proper REST API response codes

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 🚀 Deployment

### Backend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Frontend (Vercel)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the environment configuration

## 🔄 Recent Updates

- ✅ Fixed environment variable handling
- ✅ Added graceful Cloudinary fallbacks
- ✅ Improved error handling and logging
- ✅ Fixed typo in models (lecturId → lectureId, imgUrl → imageUrl)
- ✅ Enhanced multer configuration for file uploads
- ✅ Added proper HTTP status codes
- ✅ Cleaned up code structure and formatting
- ✅ Added comprehensive .env.example files
- ✅ Fixed webhook handling and payment flow
- ✅ Added database indexing for performance
- ✅ Improved authentication middleware
