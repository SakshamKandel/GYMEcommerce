import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import nodemailer, { Transporter } from "nodemailer"

type InjectedDependencies = {
  logger: Logger
}

export type SmtpEmailOptions = {
  host: string
  port?: number
  secure?: boolean
  user: string
  pass: string
  from: string
}

/**
 * SMTP email provider for the Notification module.
 *
 * Sends the raw `content` ({ subject, html, text }) that subscribers attach
 * to their notifications — no external template service involved, so the
 * whole email (order confirmation with the guest tracking code, shipment
 * notice, …) is authored in code under src/subscribers.
 *
 * Works with any SMTP relay; for a zero-cost start a Gmail address + app
 * password (SMTP_HOST=smtp.gmail.com, SMTP_PORT=465) is enough.
 */
class SmtpEmailProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp-email"

  protected logger_: Logger
  protected options_: SmtpEmailOptions
  protected transporter_: Transporter

  static validateOptions(options: Record<string, unknown>) {
    for (const key of ["host", "user", "pass", "from"]) {
      if (!options[key]) {
        throw new Error(`SMTP email provider requires the \`${key}\` option`)
      }
    }
  }

  constructor({ logger }: InjectedDependencies, options: SmtpEmailOptions) {
    super()
    this.logger_ = logger
    this.options_ = options

    const port = options.port ?? 465
    this.transporter_ = nodemailer.createTransport({
      host: options.host,
      port,
      // Implicit TLS on 465; STARTTLS is negotiated automatically on 587.
      secure: options.secure ?? port === 465,
      auth: {
        user: options.user,
        pass: options.pass,
      },
    })
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    if (!notification.to) {
      this.logger_.warn(
        `[smtp-email] dropping notification "${notification.template}" — no recipient`
      )
      return {}
    }

    const { subject, html, text } = notification.content ?? {}

    try {
      const info = await this.transporter_.sendMail({
        from: this.options_.from,
        to: notification.to,
        subject: subject ?? "Protein Pasal",
        html: html ?? undefined,
        text: text ?? undefined,
      })

      this.logger_.info(
        `[smtp-email] sent "${notification.template}" to ${notification.to} (${info.messageId})`
      )
      return { id: info.messageId }
    } catch (error) {
      // Notification failures must never take down order placement — the
      // workflow engine retries; we log loudly for the operator.
      this.logger_.error(
        `[smtp-email] failed sending "${notification.template}" to ${notification.to}: ${error?.message}`
      )
      throw error
    }
  }
}

export default SmtpEmailProviderService
