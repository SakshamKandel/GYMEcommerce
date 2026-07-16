const path = require("path")

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@medusajs/ui/dist/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width margin",
        height: "height",
        bg: "background-color",
        display: "display opacity",
        visibility: "visibility",
        padding: "padding-top padding-right padding-bottom padding-left",
      },
      colors: {
        grey: {
          0: "#FFFFFF",
          5: "#F9FAFB",
          10: "#F3F4F6",
          20: "#E5E7EB",
          30: "#D1D5DB",
          40: "#9CA3AF",
          50: "#6B7280",
          60: "#4B5563",
          70: "#374151",
          80: "#1F2937",
          90: "#111827",
        },
        // Protein Pasal palette (02-design-system §1, R2/R3)
        // PALETTE OVERRIDE: pure white system (paper/fog/line/ash) — ink/red untouched.
        ink: "#0B0B0B",
        coal: "#171717",
        paper: "#FFFFFF",
        fog: "#F5F5F5",
        line: "#E4E4E4",
        ash: "#6B6B6B", // 5.33:1 on #FFFFFF — AA for normal text
        // `red` is an object so `bg-red` (DEFAULT), `bg-red-deep` (deep) and the
        // starter's existing `text-red-500` error text all keep resolving.
        red: {
          DEFAULT: "#E10600",
          deep: "#B00500",
          500: "#E10600",
        },
      },
      borderRadius: {
        none: "0px",
        soft: "2px",
        base: "4px",
        rounded: "8px",
        large: "16px",
        circle: "9999px",
        // Protein Pasal additions (02 §2 / R17)
        pill: "9999px", // pills & round buttons (alias of rounded-full)
        photo: "1.25rem", // 20px — the ONLY radius for framed editorial photos
      },
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      fontSize: {
        "3xl": "2rem",
        // Protein Pasal fluid type scale (02 §2)
        "display-hero": [
          "clamp(3.25rem, 11vw, 11rem)",
          { lineHeight: "0.85", letterSpacing: "-0.01em" },
        ],
        "display-1": [
          "clamp(2.75rem, 7.5vw, 6.5rem)",
          { lineHeight: "0.90", letterSpacing: "-0.01em" },
        ],
        "display-2": [
          "clamp(2.25rem, 5vw, 4.5rem)",
          { lineHeight: "0.92", letterSpacing: "-0.01em" },
        ],
        stat: [
          "clamp(3rem, 8vw, 8rem)",
          { lineHeight: "0.90", letterSpacing: "-0.02em" },
        ],
        h1: [
          "clamp(2rem, 4vw, 3.25rem)",
          { lineHeight: "1.02", letterSpacing: "-0.02em" },
        ],
        h2: [
          "clamp(1.5rem, 3vw, 2.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.01em" },
        ],
        h3: ["1.5rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        h4: ["1.125rem", { lineHeight: "1.25" }],
        "body-lg": ["clamp(1.125rem, 1.6vw, 1.5rem)", { lineHeight: "1.45" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.55" }],
        label: ["0.75rem", { lineHeight: "1", letterSpacing: "0.18em" }],
        "label-sm": ["0.6875rem", { lineHeight: "1", letterSpacing: "0.2em" }],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        label: "0.18em",
        wide: "0.06em",
        wider: "0.24em",
      },
      fontFamily: {
        // sans consumes the next/font var; Inter stack stays as fallback so
        // Medusa functional components inherit cleanly (02 §2).
        sans: [
          "var(--font-body)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Ubuntu",
          "sans-serif",
        ],
        body: ["var(--font-body)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Arial Narrow", "Impact", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        ring: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "fade-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "fade-in-top": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-out-top": {
          "0%": {
            height: "100%",
          },
          "99%": {
            height: "0",
          },
          "100%": {
            visibility: "hidden",
          },
        },
        "accordion-slide-up": {
          "0%": {
            height: "var(--radix-accordion-content-height)",
            opacity: "1",
          },
          "100%": {
            height: "0",
            opacity: "0",
          },
        },
        "accordion-slide-down": {
          "0%": {
            "min-height": "0",
            "max-height": "0",
            opacity: "0",
          },
          "100%": {
            "min-height": "var(--radix-accordion-content-height)",
            "max-height": "none",
            opacity: "1",
          },
        },
        enter: {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        leave: {
          "0%": { transform: "scale(1)", opacity: 1 },
          "100%": { transform: "scale(0.9)", opacity: 0 },
        },
        "slide-in": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        // Protein Pasal additions (02 §2)
        "marquee-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-x-rev": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        ring: "ring 2.2s cubic-bezier(0.5, 0, 0.5, 1) infinite",
        "fade-in-right":
          "fade-in-right 0.3s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-in-top": "fade-in-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "fade-out-top":
          "fade-out-top 0.2s cubic-bezier(0.5, 0, 0.5, 1) forwards",
        "accordion-open":
          "accordion-slide-down 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        "accordion-close":
          "accordion-slide-up 300ms cubic-bezier(0.87, 0, 0.13, 1) forwards",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
        // Protein Pasal additions (02 §2)
        marquee: "marquee-x 32s linear infinite",
        "marquee-fast": "marquee-x 20s linear infinite",
        "marquee-rev": "marquee-x-rev 32s linear infinite",
        "reveal-up": "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [require("tailwindcss-radix")()],
}
