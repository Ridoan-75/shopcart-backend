export const env = {
  databaseUrl: process.env.DATABASE_URL!,

  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES,
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES,

  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL!,

  facebookAppId: process.env.FACEBOOK_APP_ID!,
  facebookAppSecret: process.env.FACEBOOK_APP_SECRET!,
  facebookCallbackUrl: process.env.FACEBOOK_CALLBACK_URL!,

  smtpHost: process.env.SMTP_HOST!,
  smtpPort: Number(process.env.SMTP_PORT),
  smtpUser: process.env.SMTP_USER!,
  smtpPass: process.env.SMTP_PASS!,
  smtpFrom: process.env.SMTP_FROM!,

  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  port: Number(process.env.PORT),

  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};
