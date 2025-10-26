import constants from "constants";
import { accessSync, lstatSync, readFileSync } from "fs";
import path from "path";
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

enum Command {
  Exit = "exit",
  Echo = "echo",
  Type = "type",
}

const SHELL_COMMANDS: Record<Command, true> = {
  [Command.Type]: true,
  [Command.Echo]: true,
  [Command.Exit]: true,
};

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

    if (command === "type") {
      if (SHELL_COMMANDS[args]) {
        console.log(`${args} is a shell builtin`);
      } else {
        //Implement PATH
        // PATH is an env variable on unix based OS, DOS,and microsoft
        // that represents a list of directories containing executable programs
        // if the PATH is /dir1:/dir2:/dir3 the shell will look for a specific
        // program sequentially on each folder.
        //
        // usr/local/bin can be a directory full of programs so we need to check if
        // user/local/bin/<user args> is a executable file.
        const PATH = process.env.PATH;
        const osDelimiter = path.delimiter;
        const executables = PATH?.split(osDelimiter);
        if (!executables) {
          throw new Error("Unable to read PATH");
        }
        let found = false;

        for (const exec of executables) {
          //Check if the argument is an executable file.
          try {
            const path = exec.concat("/" + args);
            accessSync(path, constants.X_OK);
            found = true;
            console.log(`${args} is ${path}`);
            break;
          } catch (e) {
            // console.log("error", err.message);
          }
        }
        if (!found) {
          console.log(`${args}: not found`);
        }
      }
      return loop();
    }

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
