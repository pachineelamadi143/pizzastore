const name = process.argv[2];

if (!name) {
  console.log("Please provide a name.");
} else {
  const now = new Date();
  console.log(`Hello, ${name}! Today is ${now}`);
}