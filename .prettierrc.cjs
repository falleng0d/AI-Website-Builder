module.exports = {
  printWidth: 127,
  endOfLine: "auto",
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./app/globals.css",
  tailwindFunctions: ["clsx", "tw", "twMerge", "cn"],
};
