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

class mkdir {
    constructor(name, type, meta, children, parent)
    {
        this.name = name;
        this.type = type;
        this.meta = meta;
        this.children = children;
        this.parent = parent
    }

    getName() {
        return this.name
    }

    getChildren() {
        return this.children
    }

    getParent() {
        return this.parent
    }

    addChild(child) {
        this.children.push(child)
    }

    getFullRoute() {
        if (this.name === "C:") {
            return this.name
        }

        return this.parent.getFullRoute() + "\\" + this.name
    }
}

class mkfile {

    constructor(name, type, meta, parent)
    {
        this.name = name;
        this.type = type;
        this.meta = meta;
        this.parent = parent
    }

    getName() {
        return this.name
    }
}

// global vars
let root = new mkdir("C:", "directory", {}, [
])
root.addChild(new mkdir("users", "directory", {}, [], root))
root.addChild(new mkdir("documents", "directory", {}, [], root))

let currentDir = root

let commands = {
    "ver" : new Command("ver", "Displays the CLE version.", ver),
    "help" : new Command("help", "Provides Help information for CLE.", help),
    "cls" : new Command("cls", "Clears the screen.", cls),
    "cle" : new Command("cle", "Starts a new instance of the Web command interpreter.", ver),
    "cd" : new Command("cd", "Displays the name of or changes the current directory.", cd),
    "md" : new Command("md", "Creates a directory.", md),
    "color": new Command("color", "Change color.", color),
    "title": new Command("title", "Change CLE title.", title)
};

$(document).ready(function () {
    let currDirSpan = document.getElementById("currentDir");
    currDirSpan.innerText = currentDir.getFullRoute() + ">"

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
    commandLine.innerText = currentDir.getFullRoute() + ">" + val + "\n";
    pastCommands.insertAdjacentElement("beforeend", commandLine);

    // handler

    if (commands.hasOwnProperty(val.toLowerCase().split(" ")[0])) {
        if (val.toLowerCase() === "help")
        {
            help(commands)
            return 0
        }
        commands[val.toLowerCase().split(" ")[0]].execute(val);
    } else {
        invalidCommand(val.toLowerCase())
    }

}

function cd(val) {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span")
    commandLine.className = "command-line";

    let route = val.split(" ")[1]

    if (val.split(" ").length === 1) {
        commandLine.innerText = currentDir.getFullRoute();
        pastCommands.insertAdjacentElement("beforeend", commandLine);
    } else if (route === "..") {
        currentDir = currentDir.getParent()

    }   else if (route.split("\\")[0].toLowerCase() === "c:") {

        if (findDirByFullPath(route) === -1) {
            commandLine.innerText = "The system cannot find the path specified.";
            pastCommands.insertAdjacentElement("beforeend", commandLine);
        }
    } else {
        if (findDirByRelativePath(route) === -1) {
            commandLine.innerText = "The system cannot find the path specified.";
            pastCommands.insertAdjacentElement("beforeend", commandLine);
        }
    }

    document.getElementById("currentDir").innerText = currentDir.getFullRoute() + ">"
    
}

function findDirByRelativePath(route) {
    let splittedRoute = route.split("\\")
    let step = 0;
    let dirToFind
    let currDir = currentDir

    while(step !== splittedRoute.length) {
        dirToFind = splittedRoute[step]
        currDir = currDir.getChildren().find(x => x.getName() === dirToFind)

        if (currDir === undefined) {
            return -1
        }

        step += 1
    }

    currentDir = currDir
    return 0
}

function findDirByFullPath(route) {
    let splittedRoute = route.split("\\")
    let step = 0;
    let dirToFind
    let currDir = root

    if ((route.toLowerCase() === "c:" || route.toLowerCase() === "c:\\")) {
        currentDir = root
        return 0
    }

    while(step !== splittedRoute.length - 1) {
        dirToFind = splittedRoute[step + 1]
        currDir = currDir.getChildren().find(x => x.getName() === dirToFind)

        if (currDir === undefined) {
            return -1
        }

        step += 1
    }

    currentDir = currDir
    return 0
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
        createDirByFullPath(route)
    } else {
        createDirByRelativePath(route)
    }


    document.getElementById("currentDir").innerText = currentDir.getFullRoute() + ">"
}

function createDirByFullPath(route) {
    let splittedRoute = route.split("\\")
    let step = 0;
    let dirToFind
    let currDir = root

    if ((route.toLowerCase() === "c:" || route.toLowerCase() === "c:\\")) {
        return 0
    }

    while(step !== splittedRoute.length - 1) {
        dirToFind = splittedRoute[step + 1]

        if (currDir.getChildren().find(x => x.getName() === dirToFind) !== undefined) {
            console.log("ll")
            currDir = currDir.getChildren().find(x => x.getName() === dirToFind)
        } else {
            currDir.addChild(new mkdir(dirToFind, "directory", {}, [], currDir))
            step -= 1
        }

        step += 1
    }

    return 0
}

function createDirByRelativePath(route) {
    let splittedRoute = route.split("\\")
    let step = 0;
    let dirToFind
    let currDir = currentDir

    if ((route.toLowerCase() === "c:" || route.toLowerCase() === "c:\\")) {
        return 0
    }

    while(step !== splittedRoute.length) {
        dirToFind = splittedRoute[step]

        if (currDir.getChildren().find(x => x.getName() === dirToFind) !== undefined) {
            console.log("ll")
            currDir = currDir.getChildren().find(x => x.getName() === dirToFind)
        } else {
            currDir.addChild(new mkdir(dirToFind, "directory", {}, [], currDir))
            step -= 1
        }

        step += 1
    }

    return 0
}

function invalidCommand(val) {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span")
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
    while(pastCommands.firstChild){
        pastCommands.removeChild(pastCommands.firstChild);
    }
}

function color(val) {
    let colors = {
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
    let root = document.querySelector(':root');
    if (val.split(' ').length === 1) {
        root.style.setProperty("--background-color", colors["0"]);
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

function title(val) {
    if (val.split(' ').length === 2) {
        document.title = val.split(' ')[1];
    }
}