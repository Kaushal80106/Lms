# 🔧 Frontend Environment Variables Setup

## Required Environment Variables

You need to set up the following environment variables in your `client/.env` file:

### 1. Backend URL
```
VITE_BACKEND_URL=http://localhost:5000
```
- For local development: `http://localhost:5000`
- For production: Your Vercel backend URL (e.g., `https://your-backend.vercel.app`)

### 2. Clerk Publishable Key
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key_here
```
- Get this from your Clerk dashboard
- Format: `pk_test_...` for test environment or `pk_live_...` for production

### 3. Currency Symbol
```
VITE_CURRENCY=$
```
- Default: `$`
- You can change to other currencies like `€`, `£`, etc.

## How to Get Your Clerk Publishable Key

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com/
2. **Select Your Application**
3. **Go to API Keys** in the sidebar
4. **Copy the Publishable Key** (starts with `pk_test_` or `pk_live_`)

## Complete .env File Example

```env
# Backend Configuration
VITE_BACKEND_URL=http://localhost:5000

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_clerk_key_here

# Currency
VITE_CURRENCY=$
```

## Important Notes

- ✅ **Never commit your .env file** to version control
- ✅ **Restart your development server** after changing environment variables
- ✅ **Use test keys** for development and **live keys** for production
- ✅ **Make sure your backend is running** on the specified URL

## Troubleshooting

### "Missing Publishable Key" Error
- Check that `VITE_CLERK_PUBLISHABLE_KEY` is set in your `.env` file
- Make sure the key starts with `pk_test_` or `pk_live_`
- Restart your development server after adding the key

### "ERR_CONNECTION_REFUSED" Error
- Make sure your backend server is running on the correct port
- Check that `VITE_BACKEND_URL` points to the correct backend URL
- Verify the backend server is accessible

### Environment Variables Not Loading
- Make sure the `.env` file is in the `client/` directory
- Restart your development server
- Check that variable names start with `VITE_`

## Development vs Production

### Development (.env.local)
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_test_key
VITE_CURRENCY=$
```

### Production (Vercel Environment Variables)
- Set these in your Vercel dashboard
- Use your production backend URL
- Use your live Clerk publishable key

---

**After setting up your environment variables, restart your development server:**
```bash
npm run dev
```
