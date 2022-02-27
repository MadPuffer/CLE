class FileSystemObject {
    constructor(name, type, parent) {
        this.name = name;
        this.type = type;
        this.parent = parent;
        this.route = parent.getRoute + "\\" + this.name;

    }

    getRoute() {
        return this.route;
    }

}

let currentDir = "C:\\"
let routes = [
    "c:\\"
]
let files = [
    new FileSystemObject("c:", "directory", new FileSystemObject("", "", ""))
]

$(document).ready(function () {
    let currDirSpan = document.getElementById("currentDir");
    currDirSpan.innerText = currentDir + ">";

    let input = document.getElementById("input-box");
    input.focus();

    input.addEventListener('input', resizeInput);
    resizeInput.call(input);

    function resizeInput() {
        this.style.width = this.value.length + "ch";
    }
});

// function getCaretPos(obj)
// {
//
//     if(obj.selectionStart) return obj.selectionStart;
//     else if (document.selection)
//     {
//         var sel = document.selection.createRange();
//         var clone = sel.duplicate();
//         sel.collapse(true);
//         clone.moveToElementText(obj);
//         clone.setEndPoint('EndToEnd', sel);
//         return clone.text.length;
//     }
//
//     return 0;
// }

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
    commandLine.innerText = currentDir + ">" + val + "\n";
    pastCommands.insertAdjacentElement("beforeend", commandLine);

    // handler

    let commands = {
        "ver": new Command("ver", "Displays the CLE version.", ver),
        "help": new Command("help", "Provides Help information for CLE.", help),
        "cls": new Command("cls", "Clears the screen.", cls),
        "cle": new Command("cle", "Starts a new instance of the Web command interpreter.", ver),
        "cd": new Command("cd", "Displays the name of or changes the current directory.", cd),
        "md": new Command("md", "Creates a directory.", md),
        "color": new Command("color", "Change color.", color)
    };


    if (commands.hasOwnProperty(val.toLowerCase().split(" ")[0])) {
        if (val.toLowerCase() === "help") {
            help(commands);
            return 0;
        }
        commands[val.toLowerCase().split(" ")[0]].execute(val);
    } else {
        invalidCommand(val.toLowerCase());
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

    execute(val) {
        this.func(val);
    }
}

function cd(val) {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span")
    commandLine.className = "command-line";

    let route = val.split(" ")[1]

    if (val.split(" ").length === 1) {
        commandLine.innerText = currentDir;
        pastCommands.insertAdjacentElement("beforeend", commandLine);
    } else if (route.split("\\")[0].toLowerCase() === "c:") {

        if (routes.find(r => r === route) === route) {
            currentDir = val.replace("c:", "C:").split(" ")[1]
        }

    }

    document.getElementById("currentDir").innerText = currentDir + ">"

    // commandLine.innerText = "'" + val + "'" + " is not recognized as an internal command";
    // pastCommands.insertAdjacentElement("beforeend", commandLine);
}

function md(val) {
    if (val.split(" ").length === 1) {
        let pastCommands = document.getElementById("editableBox");
        let commandLine = document.createElement("span")
        commandLine.className = "command-line";
        commandLine.innerText = "The syntax of the command is incorrect."
        pastCommands.insertAdjacentElement("beforeend", commandLine);
        return 0
    }

    let route = val.split(" ")[1]

    if (route.split("\\")[0].toLowerCase() === "c:") {
        routes.push(route);

        let splittedRoute = route.split("\\")
        let name = splittedRoute[splittedRoute.length - 1].split(".")[0]
        let type = splittedRoute[splittedRoute.length - 1].split(".")[1]
        if (type === undefined) {
            type = "directory"
        }
        let parent = files.find(p => p.name === splittedRoute[splittedRoute.length - 2])
        if (parent === undefined) {
            createParent(splittedRoute[splittedRoute.length - 2], splittedRoute[splittedRoute.length - 3], route, 3)
            parent = files.find(p => p.name === splittedRoute[splittedRoute.length - 1])
        }

        files.push(new FileSystemObject(name, type, parent));

        console.log(routes)
    }
}

function createParent(name, parent, route, scope) {
    let splittedRoute = route.split()

    let pr = files.find(p => p.name === parent)
    if (pr === undefined) {
        createParent(splittedRoute[splittedRoute.length - scope], splittedRoute[splittedRoute.length - scope - 1], route, scope - 1)
    }
    files.push(name, "directory", pr)
}

function invalidCommand(val) {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span");
    commandLine.className = "command-line";
    commandLine.innerText = "'" + val + "'" + " is not recognized as an internal command";
    pastCommands.insertAdjacentElement("beforeend", commandLine);
}

function ver(val) {
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

function cls(val) {
    let pastCommands = document.getElementById("editableBox");
    while (pastCommands.firstChild) {
        pastCommands.removeChild(pastCommands.firstChild);
    }
}

function color(val) {
    var colors = {
        "0": "rgb(12, 12, 12)",
        "1": "rgb(0, 55, 218)",
        "2": "rgb(19, 161, 14)",
        "3": "rgb(58, 150, 221)",
        "4": "rgb(197, 15, 31)",
        "5": "rgb(136, 23, 152)",
        "6": "rgb(193, 156, 0)",
        "7": "rgb(204, 204, 204)",
        "8": "rgb(118, 118, 118)",
        "9": "rgb(59, 120, 255)",
        "a": "rgb(22, 198, 12)",
        "b": "rgb(97, 214, 214)",
        "c": "rgb(231, 72, 86)",
        "d": "rgb(180, 0, 158)",
        "e": "rgb(249, 241, 165)",
        "f": "rgb(242, 242, 242)",

    };

    // Я думаю, тут код можно упростить, но мне лень.
    var root = document.querySelector(':root');
    if (val.split(' ').length === 1) {
        document.body.style.backgroundColor = "black";
        root.style.setProperty("--text-color", "white");
    } else if (val.split(' ').length > 1) {
        let inputColors = val.split(' ')[1];
        if (inputColors.length === 1) {
            let textColor = inputColors;
            if (colors.hasOwnProperty(textColor.toLowerCase())) {
                root.style.setProperty("--text-color", colors[textColor]);
                root.style.setProperty("--background-color", colors["0"]);
            }
        }
        else if (inputColors.length < 3) {
            let bgColor = inputColors[0];
            let textColor = inputColors[1];
            if (colors.hasOwnProperty(bgColor.toLowerCase()) && colors.hasOwnProperty(textColor.toLowerCase())) {
                root.style.setProperty("--text-color", colors[textColor]);
                root.style.setProperty("--background-color", colors[bgColor]);
            }
        }
    }
}

