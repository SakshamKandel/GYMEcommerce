"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { useSearchParams } from "next/navigation"
import {
  NEPAL_PHONE_PATTERN,
  NEPAL_PHONE_TITLE,
} from "@modules/account/utils/np-address"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)
  const redirectTo = useSearchParams().get("redirect")

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center px-2"
      data-testid="register-page"
    >
      <p className="font-mono text-label uppercase tracking-label text-red mb-4">
        Account
      </p>
      <h1 className="font-display text-display-2 uppercase text-ink text-center leading-none">
        Join Protein Pasal
      </h1>
      <p className="text-center font-body text-body-sm text-ash mt-4 mb-8">
        Create a profile for faster checkout, saved addresses &amp; order
        tracking on every Cash-on-Delivery order.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        {redirectTo && (
          <input type="hidden" name="redirect_to" value={redirectTo} />
        )}
        <div className="flex flex-col w-full gap-y-3">
          <div className="grid grid-cols-2 gap-x-3">
            <Input
              label="First name"
              name="first_name"
              required
              autoComplete="given-name"
              data-testid="first-name-input"
            />
            <Input
              label="Last name"
              name="last_name"
              required
              autoComplete="family-name"
              data-testid="last-name-input"
            />
          </div>
          <Input
            label="Email"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Phone (98XXXXXXXX)"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            pattern={NEPAL_PHONE_PATTERN}
            title={NEPAL_PHONE_TITLE}
            inputMode="numeric"
            maxLength={10}
            data-testid="phone-input"
          />
          <Input
            label="Password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center font-body text-body-sm text-ash mt-6">
          By creating an account, you agree to Protein Pasal&apos;s{" "}
          <LocalizedClientLink href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </LocalizedClientLink>{" "}
          and{" "}
          <LocalizedClientLink href="/terms" className="underline underline-offset-4">
            Terms of Use
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton
          className="w-full mt-6 !rounded-full !bg-red hover:!bg-red-deep !text-paper !font-body !text-sm !font-semibold !uppercase !tracking-wide !h-auto !py-3.5"
          data-testid="register-button"
        >
          Create account
        </SubmitButton>
      </form>
      <span className="text-center font-body text-body-sm text-ash mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="font-semibold text-ink underline underline-offset-4 hover:text-red"
          data-testid="sign-in-button"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default Register
