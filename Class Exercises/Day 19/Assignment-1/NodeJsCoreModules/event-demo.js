import EventEmitter from "events";

const emitter = new EventEmitter();

emitter.on("userLoggedIn", (name) => {
  console.log(`User ${name} logged in.`);
});

emitter.on("userLoggedOut", (name) => {
  console.log(`User ${name} logged out.`);
});

emitter.on("sessionExpired", () => {
  console.log("Session expired!");
});

emitter.emit("userLoggedIn", "John");

setTimeout(() => {
  emitter.emit("userLoggedOut", "John");
}, 2000);

setTimeout(() => {
  emitter.emit("sessionExpired");
}, 5000);
