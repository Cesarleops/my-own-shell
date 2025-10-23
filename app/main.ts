import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function loop() {
  rl.question("$ ", (answer) => {
    rl.write(answer + ":" + " command not found\n");
    // rl.close();
    return loop();
  });
}

loop();
