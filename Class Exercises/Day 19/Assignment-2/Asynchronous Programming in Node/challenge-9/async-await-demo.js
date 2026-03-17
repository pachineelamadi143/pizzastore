import { readFile, writeFile } from "fs/promises";

async function copyFile() {
  try {
    const data = await readFile("input.txt", "utf-8");

    // artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await writeFile("output-async.txt", data);
    console.log("File copied successfully using async/await!");
  } catch (err) {
    console.log("Error:", err);
  }
}

copyFile();