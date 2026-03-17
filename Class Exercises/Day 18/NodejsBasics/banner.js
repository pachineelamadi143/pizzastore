import chalk from "chalk";
import figlet from "figlet";

figlet("HI I'm Aditya", (err, data) => {
  if (err) {
    console.log("Something went wrong...");
    return;
  }
  console.log(chalk.green(data));
});