# Production Credential Activation Checklist

Use this checklist to ensure all production credentials are active and correctly configured before Go-Live.

## 1. Identity & Auth
- [ ] **Google OAuth**: Production Client ID/Secret active and Authorized Redirect URIs set to `https://ori-craftlabs.com/api/auth/callback/google`.
- [ ] **GitHub OAuth**: Production OAuth App configured with correct URLs.
- [ ] **NextAuth Secret**: A strong, unique 32-byte string generated.

## 2. Infrastructure
- [ ] **Database URL**: Points to the production PostgreSQL instance with a strong password.
- [ ] **Redis URL**: Points to the production Redis instance with AUTH enabled.
- [ ] **S3 Credentials**: Production bucket created with restricted IAM policy.

## 3. Communication
- [ ] **Resend API Key**: Production key with verified domain.
- [ ] **Mailgun/SMTP**: Secondary provider keys configured for fallback.
- [ ] **From Email**: Set to a production address (e.g., `noreply@ori-craftlabs.com`).

## 4. Payments (If applicable)
- [ ] **Stripe Secret/Public Key**: Switched from Test Mode to Live Mode.
- [ ] **Stripe Webhook Secret**: Verified for the production URL.

## 5. Intelligence
- [ ] **OpenAI API Key**: Usage limits set and credit balance verified.
- [ ] **Anthropic API Key**: Active production key.

---
**Verified By**: __________________  
**Date**: __________________
