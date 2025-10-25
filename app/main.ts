import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function loop() {
  rl.question("$ ", (answer) => {
    //exit utility shall cause the shell to exit from its current execution env with
    // the exit status specified by the unsigned decimal integer n which can be represented
    // using 1 byte
    // .
    if (answer === "exit 0") {
      rl.write("", {
        ctrl: true,
        name: "c",
      });
      return;
    }

    rl.write(answer + ":" + " command not found\n");
    return loop();
  });
}

loop();
