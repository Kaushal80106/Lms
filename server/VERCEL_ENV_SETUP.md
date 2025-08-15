# Vercel Environment Variables Setup

To deploy your LMS backend to Vercel, you need to set up the following environment variables in your Vercel project settings:

## Required Environment Variables

1. **MONGODB_URI** - Your MongoDB connection string
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

2. **CLERK_WEBHOOK_SECRET** - Your Clerk webhook secret
   ```
   whsec_your_clerk_webhook_secret_here
   ```

3. **STRIPE_SECRET_KEY** - Your Stripe secret key
   ```
   sk_test_your_stripe_secret_key_here
   ```

4. **STRIPE_WEBHOOK_SECRET** - Your Stripe webhook secret
   ```
   whsec_your_stripe_webhook_secret_here
   ```

## Optional Environment Variables

5. **CLOUDINARY_CLOUD_NAME** - Your Cloudinary cloud name
   ```
   your_cloudinary_cloud_name
   ```

6. **CLOUDINARY_API_KEY** - Your Cloudinary API key
   ```
   your_cloudinary_api_key
   ```

7. **CLOUDINARY_API_SECRET** - Your Cloudinary API secret
   ```
   your_cloudinary_api_secret
   ```

8. **CURRENCY** - Currency symbol (default: $)
   ```
   $
   ```

9. **FRONTEND_URL** - Your frontend URL for CORS
   ```
   https://your-frontend-domain.vercel.app
   ```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable with its corresponding value
5. Deploy your project

## Important Notes

- All environment variables are encrypted and secure
- You can set different values for Production, Preview, and Development environments
- Make sure to redeploy after adding environment variables
- The backend will work without Cloudinary variables, but image uploads will be disabled

## Testing Your Deployment

After deployment, test your API by visiting:
```
https://your-backend-domain.vercel.app/
```

You should see a JSON response indicating the API is working.
