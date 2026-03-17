import fs from "fs";

fs.readFile("data.txt", "utf-8", (err, data) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }

  console.log("File content:", data);

  setTimeout(() => {
    console.log("Read operation completed");
  }, 2000);
});