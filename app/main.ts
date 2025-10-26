import { accessSync } from "fs";
import { createInterface } from "readline";
import { spawnSync } from "child_process";
import path from "path";
import constants from "constants";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

enum Command {
  Exit = "exit",
  Echo = "echo",
  Type = "type",
  Pwd = "pwd",
  Cd = "cd",
}

const SHELL_COMMANDS = new Set([
  Command.Echo,
  Command.Type,
  Command.Exit,
  Command.Pwd,
  Command.Cd,
]);

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

function getPATH(): string[] {
  const PATH = process.env.PATH as string;
  const osDelimiter = path.delimiter;
  const executables = PATH.split(osDelimiter);

  return executables;
}

function isExecutable(fileName: string): string {
  const dirs = getPATH();
  for (const dir of dirs) {
    const path = `${dir}/${fileName}`;
    try {
      accessSync(path, constants.X_OK);
      return path;
    } catch (e) {
      continue;
    }
  }
  return "";
}

function loop() {
  rl.question("$ ", (answer) => {
    const { command, args } = parseCommand(answer);

    if (command === "cd") {
      try {
        process.chdir(args);
      } catch (e) {
        console.log(`cd: ${args}: No such file or directory`);
      }
      return loop();
    }

    if (command === "type") {
      if (SHELL_COMMANDS.has(args as Command)) {
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

        const exePath = isExecutable(args);
        if (exePath) {
          console.log(`${args} is ${exePath}`);
        } else {
          console.log(`${args}: not found`);
        }
      }
      return loop();
    }

    if (command === "echo") {
      console.log(`${args}`);
      return loop();
    }

    if (command === "pwd") {
      console.log(process.cwd());
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
    const executablePath = isExecutable(command);

    if (executablePath) {
      const argArray = args ? args.split(" ").filter((a) => a.length > 0) : [];
      const p = spawnSync(command, argArray, {
        shell: false,
        stdio: "inherit",
      });
    } else {
      rl.write(answer + ":" + " command not found\n");
    }
    return loop();
  });
}

loop();
