 # DreamTree Setup Guide

Follow these steps to get DreamTree running with real API keys.

---

## 1. Generate Platform Encryption Key

Run this command to generate a secure encryption key:

```bash
# Option 1: Using OpenSSL (if available)
openssl rand -hex 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it into `.env.local` as `PLATFORM_ENCRYPTION_KEY`

---

## 2. Set Up Anthropic API Key

### Get Your API Key:
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

### Add to .env.local:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Test It:
The AI chat endpoint will now work. You can test it once the server is running.

---

## 3. Set Up Stripe (Test Mode)

### Get Your Test API Keys:
1. Go to https://dashboard.stripe.com/test/apikeys
2. Sign up or log in
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - click "Reveal"

### Add to .env.local:
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

### Set Up Webhook (for local testing):
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/payment/webhook`
4. Copy the webhook signing secret (starts with `whsec_`)
5. Add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

**Note:** Keep `stripe listen` running in a separate terminal while testing payments.

---

## 4. Set Up WalletConnect (Optional)

### Get Project ID:
1. Go to https://cloud.walletconnect.com/
2. Sign up or log in
3. Create a new project
4. Copy the Project ID

### Add to .env.local:
```bash
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

**Note:** WalletConnect will still work without this, but you'll see a warning. The project ID improves reliability.

---

## 5. Start the Development Server

```bash
cd dreamtree
npm run dev
```

Server will start at: **http://localhost:3000**

---

## 6. Testing Checklist

### ✅ Test Wallet Connection
1. Visit http://localhost:3000
2. Click "Connect Wallet" (you'll need MetaMask installed)
3. Approve the connection
4. You should see your wallet address displayed

### ✅ Test Payment Flow
1. Click "Start Your Journey - $25"
2. You'll be redirected to Stripe Checkout
3. Use test card: `4242 4242 4242 4242`
4. Any future date for expiry
5. Any 3 digits for CVC
6. Complete the payment
7. You should be redirected to the success page

**Check webhook received:**
- Look at the terminal running `stripe listen`
- You should see a `checkout.session.completed` event

### ✅ Test AI Chat
Once the ChatInterface is integrated into a page, you can test:
1. Navigate to an exercise page (we'll create a test page)
2. Type a message
3. Should get a response from Claude
4. Cost should be displayed

### ✅ Test Data Encryption
1. Connect wallet
2. Sign the master key message
3. Data should be stored encrypted in IndexedDB
4. Check: Open DevTools → Application → IndexedDB → dreamtree-db

---

## 7. Common Issues

### "Invalid API key" Error
- Double-check you copied the full key
- Make sure there are no extra spaces
- Restart the dev server after adding keys

### Stripe Webhook Not Receiving Events
- Make sure `stripe listen` is running
- Check the webhook secret matches
- Verify the forward URL is correct

### Wallet Connection Issues
- Make sure MetaMask is installed
- Try refreshing the page
- Check browser console for errors

### Build Errors
- Run `npm run build` to check for TypeScript errors
- Check all environment variables are set correctly

---

## 8. Next Steps After Testing

Once everything works:
1. ✅ Test each feature thoroughly
2. 📝 Note any bugs or issues
3. 🚀 Continue building FormBuilder and modules
4. 🎨 Polish the UI
5. 🌐 Deploy to Cloudflare Pages (with production keys)

---

## Environment Variables Reference

### Required for Basic Functionality:
- `ANTHROPIC_API_KEY` - AI chat
- `STRIPE_SECRET_KEY` - Payments
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Payment UI
- `PLATFORM_ENCRYPTION_KEY` - Data encryption

### Required for Payment Webhooks:
- `STRIPE_WEBHOOK_SECRET` - Verify webhook events

### Optional but Recommended:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Better wallet UX
- `ADMIN_PASSWORD` - Admin dashboard access

### Not Needed for Local Dev:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `DATABASE_ID`

---

## Quick Start (TL;DR)

```bash
# 1. Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Get Anthropic API key from console.anthropic.com
# 3. Get Stripe test keys from dashboard.stripe.com/test/apikeys
# 4. Add all to .env.local

# 5. Start Stripe webhook listener (separate terminal)
stripe listen --forward-to localhost:3000/api/payment/webhook

# 6. Start dev server
npm run dev

# 7. Visit http://localhost:3000
```

---

## Need Help?

Check the error logs in the terminal or browser console. Most issues are related to:
- Missing/incorrect API keys
- Stripe webhook not running
- Environment variables not loaded (restart server)
