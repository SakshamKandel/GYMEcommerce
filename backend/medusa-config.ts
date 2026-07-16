import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

/**
 * Email provider selection: real SMTP delivery when credentials are present
 * (any relay works — Gmail app password is the zero-cost option), otherwise
 * the built-in local provider logs notifications to the console so the
 * order/shipment email flow stays observable in dev.
 */
const smtpConfigured =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS

const emailProvider = smtpConfigured
  ? {
      resolve: './src/modules/smtp-email',
      id: 'smtp-email',
      options: {
        channels: ['email'],
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      },
    }
  : {
      resolve: '@medusajs/medusa/notification-local',
      id: 'local',
      options: {
        channels: ['email'],
      },
    }

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [emailProvider],
      },
    },
  ],
})
