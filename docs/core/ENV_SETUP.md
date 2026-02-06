# 🔧 Environment Setup Guide

## .env.local Configuration

Create a `.env.local` file in the project root with the following content:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=Z6r9pQvKxM2nL8wT4yU0jH5fB3cN7eR1oS9gA2dF6hJ
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (Optional - Leave empty for demo testing)
# Get credentials from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Fragella API (Optional - search uses local/cache if missing)
# Get key from: https://api.fragella.com
FRAGELLA_API_KEY=
```

## Quick Setup

1. Copy the content above to `.env.local` in the project root
2. For demo testing, you can leave Google credentials empty
3. Run `npm run test:auth` to verify configuration
4. Run `npm run dev` to start the development server

## Testing Authentication

```bash
# Test environment variables
npm run test:auth

# Start dev server with auth URL
npm run dev:auth

# Or just start normally (Next.js loads .env.local automatically)
npm run dev
```

## Demo Credentials

- **Email:** demo@askseba.com
- **Password:** 123456

These credentials work with the demo authentication setup.

## Production Setup

1. Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

2. Get Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

3. Update `.env.local` with production values

4. Set `NEXTAUTH_URL` to your production domain

## Fragella & IFRA

- **FRAGELLA_API_KEY** (اختياري): مفتاح API لـ [Fragella](https://api.fragella.com) لبحث العطور الحي. إن لم يُضف، البحث يعمل من البيانات المحلية والكاش فقط.
- **IFRA**: لا يتطلب متغير بيئة؛ يعتمد على Prisma وجدول `ifra_materials`. شغّل `npx prisma db seed` لملء بيانات IFRA إن لزم.
