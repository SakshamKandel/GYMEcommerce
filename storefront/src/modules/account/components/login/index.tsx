import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(login, null)

  return (
    <div
      className="w-full max-w-sm flex flex-col items-center px-2"
      data-testid="login-page"
    >
      <p className="font-mono text-label uppercase tracking-label text-red mb-4">
        Account
      </p>
      <h1 className="font-display text-display-2 uppercase text-ink text-center leading-none">
        Welcome back
      </h1>
      <p className="text-center font-body text-body-sm text-ash mt-4 mb-8">
        Sign in for order history, saved addresses &amp; faster checkout.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-3">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton
          data-testid="sign-in-button"
          className="w-full mt-6 !rounded-full !bg-red hover:!bg-red-deep !text-paper !font-body !text-sm !font-semibold !uppercase !tracking-wide !h-auto !py-3.5"
        >
          Sign in
        </SubmitButton>
      </form>
      <span className="text-center font-body text-body-sm text-ash mt-6">
        Not a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="font-semibold text-ink underline underline-offset-4 hover:text-red"
          data-testid="register-button"
        >
          Join Protein Pasal
        </button>
        .
      </span>
    </div>
  )
}

export default Login
