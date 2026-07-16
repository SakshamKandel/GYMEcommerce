import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex flex-col gap-4 small:flex-row small:items-center small:justify-between bg-fog px-6 py-5">
      <div>
        <h2 className="font-body text-h4 font-semibold text-ink">
          Log in to place your order
        </h2>
        <p className="mt-1 font-body text-body-sm text-ash">
          An account is required to checkout — it keeps your orders trackable
          and your details safe. New here? Registering takes a minute.
        </p>
      </div>
      <LocalizedClientLink
        href="/account"
        data-testid="sign-in-button"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-ink px-6 py-3 font-body text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-paper self-start"
      >
        Log in
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
