import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Anton, Inter, Space_Mono } from "next/font/google"
import "styles/globals.css"

// Brand fonts (02-design-system §3.1) — self-hosted via next/font/google.
const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})
const mono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Protein Pasal — Authentic Supplements in Nepal",
    template: "%s | Protein Pasal",
  },
  description:
    "Nepal's multi-brand protein and sports-nutrition store. 100% authentic supplements, Cash on Delivery all over Nepal.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="bg-paper text-ink font-body antialiased">
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
