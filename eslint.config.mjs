import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  // Ignora build, dependencias y el prototipo de referencia (no es código de la app).
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "erosion-calculadora_2.jsx",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
