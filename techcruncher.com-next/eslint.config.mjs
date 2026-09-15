import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Images come from Cloudinary and arbitrary editor-pasted hosts; SmartImage
      // handles sizing, lazy loading and fallbacks itself.
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;
