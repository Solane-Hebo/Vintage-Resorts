/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f10",
        surface: "#171718",
        text: "#f5f4f1",
        muted: "#c8c6c0",
        accent: "#d9a886",
        accentHover: "#8e664a",
        inputBg: "#1f1f21",
        danger: "#ef4444",
        success: "#10b981",
      },
        fontFamily: {
        heading: ["Limelight", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["60px", { lineHeight: "72px", letterSpacing: "-0.05em" }],
        h2: ["40px", { lineHeight: "52px", letterSpacing: "-0.03em" }],
        h3: ["28px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        'x12': '1.2rem'
      },
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.12"
      }
    },
     screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
}

