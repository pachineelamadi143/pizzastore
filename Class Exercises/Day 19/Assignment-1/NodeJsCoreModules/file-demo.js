import { writeFile, readFile } from "fs/promises";

async function run() {
  await writeFile("feedback.txt", "Node.js is awesome!");
  console.log("Data written successfully.");

  console.log("Reading file...");
  const data = await readFile("feedback.txt", "utf-8");
  console.log(data);
}

run();