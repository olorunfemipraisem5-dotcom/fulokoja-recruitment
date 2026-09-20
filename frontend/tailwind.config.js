/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        university: {
          green: "#2563EB",
          gold: "#60A5FA",
          dark: "#0F172A",
        },
      },
    },
  },
  plugins: [],
};
