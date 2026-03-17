import { readFile, writeFile } from "fs/promises";

readFile("input.txt", "utf-8")
  .then((data) => {
    return writeFile("output.txt", data);
  })
  .then(() => {
    console.log("File copied successfully!");
  })
  .catch((err) => {
    console.log("Error:", err);
  });