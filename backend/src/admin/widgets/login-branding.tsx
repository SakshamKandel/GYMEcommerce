import { defineWidgetConfig } from "@medusajs/admin-sdk"

/**
 * Rebrands the admin login page for Protein Pasal.
 *
 * The dashboard has no config for replacing the login logo/title, so this
 * widget (zone "login.before", rendered directly above the login form)
 * hides the stock Medusa avatar + "Welcome to Medusa" heading via scoped
 * CSS and renders the Protein Pasal identity in their place. Selectors
 * target the login card only (max-w-[280px] wrapper) and fail closed:
 * if a dashboard update changes them, the stock branding simply reappears.
 */
const LoginBranding = () => {
  return (
    <>
      <style>{`
        div[class*="max-w-[280px]"] > div[class*="w-[50px]"] { display: none; }
        div[class*="max-w-[280px]"] > div:has(> h1) { display: none; }
      `}</style>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            background: "#0B0B0B",
            color: "#F4F1EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            fontWeight: 900,
            fontSize: 18,
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          PP
        </div>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          Welcome to Protein Pasal
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "#6E6A62",
            margin: "4px 0 0",
            textAlign: "center",
          }}
        >
          Sign in to manage Nepal&apos;s multi-brand protein store
        </p>
        <span
          style={{
            marginTop: 10,
            height: 3,
            width: 48,
            background: "#E10600",
            display: "block",
          }}
        />
      </div>
    </>
  )
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default LoginBranding
