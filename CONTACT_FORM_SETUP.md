# Contact Form Setup Guide

Your portfolio now has a working contact form with captcha protection and email sending capabilities!

## Required Setup Steps

### 1. Get hCaptcha Keys (Free)
1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com/)
2. Sign up for a free account
3. Create a new site
4. Copy your **Site Key** and **Secret Key**

### 2. Get Resend API Key (Free tier available)
1. Go to [Resend](https://resend.com/)
2. Sign up for an account
3. Go to API Keys section
4. Create a new API key
5. Copy your API key

### 3. Set Up Environment Variables
Create a `.env.local` file in your project root:

```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# hCaptcha Keys
HCAPTCHA_SECRET_KEY=0x000000000xxxxxxxxxxxxx
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Your contact email
CONTACT_EMAIL=hey@hectormendoza.me
```

### 4. Verify Domain with Resend (Optional but Recommended)
For production use, verify your own domain in Resend:
1. Go to Resend Dashboard → Domains
2. Add your domain
3. Add the DNS records they provide
4. Update the `from` field in `/app/api/contact/route.js`:
   ```js
   from: 'Contact Form <contact@yourdomain.com>'
   ```

### 5. Test the Form
1. Start your dev server: `npm run dev`
2. Go to the contact section
3. Fill out the form
4. Complete the captcha
5. Submit!

## How It Works

1. **User fills form** → validates all required fields
2. **Completes captcha** → hCaptcha verifies they're human
3. **Submits form** → sends to `/api/contact` endpoint
4. **API verifies captcha** → checks with hCaptcha servers
5. **Sends email** → uses Resend to send email to you
6. **Shows confirmation** → user sees success message

## Security Features

- ✅ hCaptcha prevents bot submissions
- ✅ Server-side captcha verification
- ✅ Required field validation
- ✅ Email validation
- ✅ Rate limiting (through hCaptcha)

## Free Tier Limits

- **Resend**: 100 emails/day, 3,000/month
- **hCaptcha**: Unlimited verifications

## Troubleshooting

### Captcha not showing?
- Make sure `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` is set
- Restart your dev server after adding env variables

### Emails not sending?
- Check `RESEND_API_KEY` is correct
- Verify your API key in Resend dashboard
- Check browser console and terminal for errors

### "Context Lost" error in console?
- This is related to the 3D scene, not the form
- Already optimized in the scene-3d.jsx component

## Need Help?
Check the API logs in your terminal when submitting the form for detailed error messages.
