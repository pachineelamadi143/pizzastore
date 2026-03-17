import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Node version:", process.version);
console.log("File name:", __filename);
console.log("Directory name:", __dirname);

let count = 0;

const timer = setInterval(() => {
  console.log("Welcome to Node.js 🚀");
  count++;

  if (count === 3) {
    clearInterval(timer);
    console.log("Timer stopped.");
  }
}, 3000);