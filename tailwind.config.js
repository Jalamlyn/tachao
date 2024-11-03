import { nextui } from "@nextui-org/theme"
const { fontFamily } = require("tailwindcss/defaultTheme")
const { addDynamicIconSelectors } = require("@iconify/tailwind")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // 更新为优雅的蓝色主题配色方案
        'primary-dark': '#1a365d',    // 深蓝色
        'primary-light': '#ebf8ff',   // 浅蓝白色
        'primary-mid': '#3182ce',     // 中蓝色
        'accent': '#4299e1',          // 亮蓝色
        'text-primary': '#2d3748',    // 主要文字颜色
        'text-secondary': '#4a5568',  // 次要文字颜色
        'text-light': '#a0aec0',      // 浅色文字
        'surface': '#ffffff',         // 表面颜色
        'surface-hover': '#f7fafc',   // 悬停表面颜色
        'divider': '#e2e8f0',         // 分割线颜色
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        slide: {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        shimmer: {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shimmer-width)) 0",
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shimmer-width)) 0",
          },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 8s infinite",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        slide: "slide var(--speed) ease-in-out infinite alternate",
        'gradient': 'gradient 8s linear infinite',
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#FFFFFF",
            foreground: "#11181C",
            primary: {
              50: "#E6F1FE",
              100: "#CCE3FD", 
              200: "#99C7FB",
              300: "#66AAF9",
              400: "#338EF7",
              500: "#006FEE",
              600: "#005BC4",
              700: "#004493",
              800: "#002E62",
              900: "#001731",
              DEFAULT: "#006FEE",
              foreground: "#FFFFFF",
            },
            secondary: {
              50: "#F2F2F3",
              100: "#E6E6E8",
              200: "#CCCCD1",
              300: "#B3B3BA",
              400: "#9999A3",
              500: "#80808C",
              600: "#666670",
              700: "#4D4D54",
              800: "#333338",
              900: "#1A1A1C",
              DEFAULT: "#80808C",
              foreground: "#FFFFFF",
            },
            success: {
              50: "#E8FFF3",
              100: "#D1FFE7",
              200: "#A3FFCF",
              300: "#75FFB7",
              400: "#47FF9F",
              500: "#1AFF87",
              600: "#00CC6A",
              700: "#00994F",
              800: "#006635",
              900: "#00331A",
              DEFAULT: "#1AFF87",
              foreground: "#FFFFFF",
            },
            warning: {
              50: "#FFF8E6",
              100: "#FFF1CC",
              200: "#FFE299",
              300: "#FFD466",
              400: "#FFC533",
              500: "#FFB700",
              600: "#CC9200",
              700: "#996E00",
              800: "#664900",
              900: "#332500",
              DEFAULT: "#FFB700",
              foreground: "#FFFFFF",
            },
            danger: {
              50: "#FFE6E6",
              100: "#FFCCCC",
              200: "#FF9999",
              300: "#FF6666",
              400: "#FF3333",
              500: "#FF0000",
              600: "#CC0000",
              700: "#990000",
              800: "#660000",
              900: "#330000",
              DEFAULT: "#FF0000",
              foreground: "#FFFFFF",
            },
            focus: "#006FEE",
          },
        },
        dark: {
          colors: {
            background: "#000000",
            foreground: "#ECEDEE",
            primary: {
              50: "#001731",
              100: "#002E62",
              200: "#004493",
              300: "#005BC4",
              400: "#006FEE",
              500: "#338EF7",
              600: "#66AAF9",
              700: "#99C7FB",
              800: "#CCE3FD",
              900: "#E6F1FE",
              DEFAULT: "#338EF7",
              foreground: "#FFFFFF",
            },
            secondary: {
              50: "#1A1A1C",
              100: "#333338",
              200: "#4D4D54",
              300: "#666670",
              400: "#80808C",
              500: "#9999A3",
              600: "#B3B3BA",
              700: "#CCCCD1",
              800: "#E6E6E8",
              900: "#F2F2F3",
              DEFAULT: "#9999A3",
              foreground: "#FFFFFF",
            },
            success: {
              50: "#00331A",
              100: "#006635",
              200: "#00994F",
              300: "#00CC6A",
              400: "#1AFF87",
              500: "#47FF9F",
              600: "#75FFB7",
              700: "#A3FFCF",
              800: "#D1FFE7",
              900: "#E8FFF3",
              DEFAULT: "#47FF9F",
              foreground: "#FFFFFF",
            },
            warning: {
              50: "#332500",
              100: "#664900",
              200: "#996E00",
              300: "#CC9200",
              400: "#FFB700",
              500: "#FFC533",
              600: "#FFD466",
              700: "#FFE299",
              800: "#FFF1CC",
              900: "#FFF8E6",
              DEFAULT: "#FFC533",
              foreground: "#FFFFFF",
            },
            danger: {
              50: "#330000",
              100: "#660000",
              200: "#990000",
              300: "#CC0000",
              400: "#FF0000",
              500: "#FF3333",
              600: "#FF6666",
              700: "#FF9999",
              800: "#FFCCCC",
              900: "#FFE6E6",
              DEFAULT: "#FF3333",
              foreground: "#FFFFFF",
            },
            focus: "#338EF7",
          },
        },
      },
      addCommonColors: true,
    }),
    require("tailwindcss-animate"),
    addDynamicIconSelectors(),
  ],
}