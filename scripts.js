$(document).ready(function () {

    let input = document.getElementById("input-box");

    input.addEventListener('input', resizeInput);
    resizeInput.call(input);

    function resizeInput() {
        this.style.width = this.value.length + "ch";
    }
});

function getCaretPos(obj)
{

    if(obj.selectionStart) return obj.selectionStart;
    else if (document.selection)
    {
        var sel = document.selection.createRange();
        var clone = sel.duplicate();
        sel.collapse(true);
        clone.moveToElementText(obj);
        clone.setEndPoint('EndToEnd', sel);
        return clone.text.length;
    }

    return 0;
}

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

    let commandLine = document.createElement("span")
    commandLine.className = "command-line";
    commandLine.innerText = "C:\\Users\\Billy>" + val + "\n";
    pastCommands.insertAdjacentElement("beforeend", commandLine);

    // handler

    let commands = {
        "ver" : new Command("ver", "Displays the CLE version.", ver),
        "help" : new Command("help", "Provides Help information for CLE.", help),
        "cls" : new Command("cls", "Clears the screen.", cls),
        "cle" : new Command("cle", "Starts a new instance of the Web command interpreter.", ver),
    };


    if (commands.hasOwnProperty(val)) {
        if (val === "help")
        {
            help(commands)
            return 0
        }
        commands[val].execute();
    } else {
        invalidCommand(val)
    }

}

class Command {
    constructor(name, desc, func) {
        this.name = name;
        this.desc = desc;
        this.func = func;
    }

    getInfo() {
        return this.desc;
    }

    execute() {
        this.func();
    }
}

function invalidCommand(val) {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span")
    commandLine.className = "command-line";
    commandLine.innerText = "'" + val + "'" + " is not recognized as an internal command";
    pastCommands.insertAdjacentElement("beforeend", commandLine);
}

function ver() {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span")
    commandLine.className = "command-line";
    commandLine.innerText = "CommandLine Emulator [Version 0.0.6.9]";
    pastCommands.insertAdjacentElement("beforeend", commandLine);
}

function help(commands) {
    let pastCommands = document.getElementById("editableBox");
    for (const key in commands) {
        let commandLine = document.createElement("span")
        commandLine.className = "command-line";
        commandLine.innerText = key.toUpperCase() + '\u00A0'.repeat(20 - key.length) + commands[key].getInfo();
        pastCommands.insertAdjacentElement("beforeend", commandLine);
    }

}

function cls() {
    let pastCommands = document.getElementById("editableBox");
    while(pastCommands.firstChild){
        pastCommands.removeChild(pastCommands.firstChild);
    }
}

