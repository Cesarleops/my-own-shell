import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

type ParsedCommand = {
  command: string;
  args: string;
};

function parseCommand(input: string): ParsedCommand {
  // we should remove whitespaces on both ends but respect casing
  const normalizedCommand = input.trim();
  const [command, ...args] = normalizedCommand.split(" ");

  return {
    command,
    args: args.join(" "),
  };
}
function loop() {
  rl.question("$ ", (answer) => {
    const { command, args } = parseCommand(answer);

    if (command === "echo") {
      console.log(`${args}`);
      return loop();
    }
    //exit utility shall cause the shell to exit from its current execution env with
    // the exit status specified by the unsigned decimal integer n which can be represented
    // using 1 byte
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
