import http from "http";

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("Hello from Node.js Server");
  } else if (req.url === "/about") {
    res.end("About Page");
  } else {
    res.end("Page Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});