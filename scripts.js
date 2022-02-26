$(document).ready(function () {

    let input = document.getElementById("input-box");

    input.addEventListener('input', resizeInput);
    resizeInput.call(input);

    function resizeInput() {
        this.style.width = this.value.length + "ch";
    }
});

$("#input-box").keyup(function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        enterCommand(document.getElementById("input-box"));

    }
});

function enterCommand(inputArea) {
    let val = inputArea.value;
    inputArea.value = "";
    inputArea.style.width = inputArea.value.length + "ch";

    let pastCommands = document.getElementById("editableBox");

    let commandLine = document.createElement("span");
    commandLine.className = "command-line";
    commandLine.innerText = "C:\\Users\\Billy>" + val + "\n";
    pastCommands.insertAdjacentElement("beforeend", commandLine);

    // handler

    let commands = {
        "ver" : ver,
        "help" : help
    };


    if (commands.hasOwnProperty(val)) {
        if (val === "help")
        {
            help(commands);
            return 0;
        }
        commands[val];
    }

}

function ver() {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span");
    commandLine.className = "command-line";
    commandLine.innerText = "C:\\Users\\Billy>" + "CommandLine Emulator [Version 0.0.6.9]" + "\n";
    pastCommands.insertAdjacentElement("beforeend", commandLine);
}

function help(commands) {
    let pastCommands = document.getElementById("editableBox");
    for (const key in commands) {
        let commandLine = document.createElement("span");
        commandLine.className = "command-line";
        commandLine.innerText = key.toUpperCase() + "\n";
        pastCommands.insertAdjacentElement("beforeend", commandLine);
    }

}

class Command {
    constructor(name, desc, func) {
        this.name = name;
        this.desc = desc;
        this.func = func;
    }

    getInfo() {
        // Return info about this command
    }

    execute() {
        func();
    }
}