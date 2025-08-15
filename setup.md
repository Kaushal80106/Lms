# LMS Setup Guide

## Quick Start Setup

### 1. Environment Setup

#### Create Client Environment File
Create `client/.env` with:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
VITE_BACKEND_URL=http://localhost:5000
VITE_CURRENCY=USD
```

#### Create Server Environment File
Create `server/.env` with:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
CLOUDINARY_API_KEY=your_cloudinary_api_key_here
CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
CURRENCY=USD
```

### 2. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Start Development Servers

#### Terminal 1 - Start Server
```bash
cd server
npm run server
```

#### Terminal 2 - Start Client
```bash
cd client
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Required Services Setup

### MongoDB
1. Create a MongoDB Atlas account or use local MongoDB
2. Get your connection string
3. Add to `MONGODB_URI` in server `.env`

### Clerk Authentication
1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Get your publishable key and webhook secret
4. Add to client and server `.env` files

### Stripe
1. Create a Stripe account at https://stripe.com
2. Get your secret key and webhook secret
3. Add to server `.env` file
4. Configure webhook endpoint: `http://localhost:5000/stripe`

### Cloudinary
1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and secret
3. Add to server `.env` file

## Common Issues & Solutions

### 1. MongoDB Connection Error
- Check if MongoDB is running
- Verify connection string format
- Ensure network access is allowed

### 2. Clerk Authentication Issues
- Verify publishable key is correct
- Check if webhook secret matches
- Ensure Clerk application is properly configured

### 3. Stripe Payment Issues
- Verify Stripe keys are correct
- Check webhook endpoint configuration
- Ensure webhook secret is properly set

### 4. CORS Issues
- Verify backend URL in client environment
- Check if server is running on correct port
- Ensure CORS middleware is properly configured

## Testing the Setup

### 1. Test Backend
- Visit http://localhost:5000
- Should see "API working" message

### 2. Test Frontend
- Visit http://localhost:5173
- Should see the LMS homepage
- Try to sign up/sign in with Clerk

### 3. Test Payment Flow
- Browse courses
- Try to purchase a course
- Verify Stripe checkout loads
- Check webhook processing

## Production Deployment

### Vercel (Frontend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Railway/Heroku (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy

### Environment Variables for Production
- Update `VITE_BACKEND_URL` to production backend URL
- Ensure all API keys are production keys
- Update webhook endpoints to production URLs

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all services are properly configured
4. Check the README.md for detailed information
