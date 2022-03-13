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

    getType() {
        return this.type
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

    addMeta(prop, arg) {
        this.meta[prop] = arg
    }

    getFullRoute() {
        if (this.name === "C:") {
            return this.name
        }

        return this.parent.getFullRoute() + "\\" + this.name
    }

    delete() {
        this.parent.getChildren().splice(this.parent.getChildren().indexOf(this), 1)
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

    getType() {
        return this.type
    }

    getParent() {
        return this.parent
    }

    delete() {
        this.parent.getChildren().splice(this.parent.getChildren().indexOf(this), 1)
    }
}

// global vars
let root = new mkdir("C:", "directory", {}, [
])
root.addChild(new mkdir("USERS", "directory", {}, [], root))
root.addChild(new mkdir("DOCUMENTS", "directory", {}, [], root))

let currentDir = root

let commands = {
    "ver" : new Command("ver", "Displays the CLE version.", ver),
    "help" : new Command("help", "Provides Help information for CLE.", help),
    "cls" : new Command("cls", "Clears the screen.", cls),
    "cle" : new Command("cle", "Starts a new instance of the Web command interpreter.", ver),
    "cd" : new Command("cd", "Displays the name of or changes the current directory.", cd),
    "md" : new Command("md", "Creates a directory.", md),
    "rd" : new Command("rd", "Removes a directory.", rd),
    "dir" : new Command("dir", "Shows directory's children elements", dir),
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

function resizeInput(obj) {
    obj.style.width = obj.value.length + "ch";
}

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

    let reg = /[а-яА-ЯёЁ]/g;
    if (this.value.search(reg) !==  -1) {
        this.value = this.value.replace(reg, '');
        resizeInput(this);
    }

    playClickSound()

    if (event.keyCode === 13) {
        event.preventDefault();
        enterCommand(document.getElementById("input-box"));
    }
});

function playClickSound() {
    var audio = new Audio();
    audio.preload = 'auto';
    audio.src = 'media\\key' + Math.floor(Math.random() * 4) + '.mp3';
    audio.play();
}

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

function dir(val) {
    let pastCommands = document.getElementById("editableBox");

    let children = currentDir.getChildren()
    for (let i = 0; i < children.length; ++i) {
        let commandLine = document.createElement("span")
        commandLine.className = "command-line";
        commandLine.innerText = children[i].getName() +
            '\u00A0'.repeat(60 - (children[i].getName().length) * 2.34) + children[i].getType()
        pastCommands.insertAdjacentElement("beforeend", commandLine);
    }

}

function rd(val) {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span")
    commandLine.className = "command-line";

    let route = val.split(" ")[1].toUpperCase()
    let currDir
    let splittedRoute = route.split("\\")

    if (splittedRoute.length === 1) {
        if (splittedRoute[0].split(".")[1] !== "") {
            let file = currentDir.getChildren().find(x => x.getName() === splittedRoute[0].split(".")[0])
            if (file !== undefined) {
                file.delete()
            } else {
                commandLine.innerText = "The system cannot find the path specified.";
                pastCommands.insertAdjacentElement("beforeend", commandLine);
            }
        return  0
        }
        findDirByRelativePath(splittedRoute[0]).delete()
        return 0
    }

    if (splittedRoute[0] === "C:") {
        if (splittedRoute[splittedRoute.length - 1].split(".")[1] === "") {
            currDir = findDirByFullPath(route)
        }
        else {
            let file = splittedRoute.splice(splittedRoute.length - 1, 1)[0]
            currDir = findDirByFullPath(splittedRoute.join("\\"))

            let children = currDir.getChildren()
            currDir = children.find(x => x.getName() === file.split(".")[0])
        }

    } else {
        if (splittedRoute[splittedRoute.length - 1].split(".")[1] === "") {
            currDir = findDirByRelativePath(route)
        }
        else {
            let file = splittedRoute.splice(
                splittedRoute.length - 1, 1)[0]
            currDir = findDirByRelativePath(splittedRoute.join("\\"), true)

            let children = currDir.getChildren()

            currDir = children.find(x => x.getName() === file.split(".")[0])
        }
    }

    if (currDir === -1 || currDir === undefined) {
        commandLine.innerText = "The system cannot find the path specified.";
        pastCommands.insertAdjacentElement("beforeend", commandLine);
    } else {
        currDir.delete()
    }

}

function cd(val) {
    let pastCommands = document.getElementById("editableBox");
    let commandLine = document.createElement("span")
    commandLine.className = "command-line";

    let route = val.split(" ").slice(1).join(" ").toUpperCase()

    if (val.split(" ").length === 1) {
        commandLine.innerText = currentDir.getFullRoute();
        pastCommands.insertAdjacentElement("beforeend", commandLine);
    } else if (route === "..") {
        currentDir = currentDir.getParent()

    }   else if (route.split("\\")[0] === "C:") {

        let currDir = findDirByFullPath(route)
        if (currDir === -1) {
            commandLine.innerText = "The system cannot find the path specified.";
            pastCommands.insertAdjacentElement("beforeend", commandLine);
        } else {
            currentDir = currDir
        }
    } else {
        let currDir = findDirByRelativePath(route)
        if (currDir === -1) {
            commandLine.innerText = "The system cannot find the path specified.";
            pastCommands.insertAdjacentElement("beforeend", commandLine);
        } else {
            currentDir = currDir
        }
    }

    document.getElementById("currentDir").innerText = currentDir.getFullRoute() + ">"

}

function findDirByRelativePath(route, rdCall = false) {
    let splittedRoute = route.toUpperCase().split("\\")
    let step = 0;
    let dirToFind
    let currDir = currentDir

    if (splittedRoute.length === 1 && rdCall) {
        return currDir.getChildren().find(x => x.getName() === splittedRoute[0])
    }

    while(step !== splittedRoute.length) {
        dirToFind = splittedRoute[step]
        currDir = currDir.getChildren().find(x => x.getName() === dirToFind)

        if (currDir === undefined || currDir.getType() !== "directory") {
            return -1
        }

        step += 1
    }

    return currDir
}

function findDirByFullPath(route) {
    let splittedRoute = route.split("\\")
    let step = 0;
    let dirToFind
    let currDir = root

    if ((route === "C:" || route === "C:\\")) {
        return currDir
    }

    while(step !== splittedRoute.length - 1) {
        dirToFind = splittedRoute[step + 1]
        currDir = currDir.getChildren().find(x => x.getName() === dirToFind)

        if (currDir === undefined || currDir.getType() !== "directory") {
            return -1
        }

        step += 1
    }

    return currDir
}

function md(val) {
    let createdElement

    if (val.split(" ").length === 1) {
        let pastCommands = document.getElementById("editableBox");
        let commandLine = document.createElement("span")
        commandLine.className = "command-line";
        commandLine.innerText = "The syntax of the command is incorrect."
        pastCommands.insertAdjacentElement("beforeend", commandLine);
        return 0
    }

    let route = val.split(" ").slice(1).join(" ").toUpperCase()

    let name = route.split("\\")[route.split("\\").length - 1].split(".")[0]
    let type = route.split("\\")[route.split("\\").length - 1].split(".")[1]

    if (route.split("\\")[0] === "C:") {

        if (route.split(".")[1] !== undefined) {
            route = route.split("\\").slice(0, route.split("\\").length - 1).join("\\")
            createdElement = createFileByFullPath(route, name, type)
            return 0
        }
        createdElement = createDirByFullPath(route)
    } else {

        if (route.split(".")[1] !== undefined) {
            route = route.split("\\").slice(0, route.split("\\").length - 1).join("\\")
            createdElement = createFileByRelativePath(route, name, type)
            return 0
        }
        createdElement = createDirByRelativePath(route)
    }

    // ДОДЕЛАТЬ
    createdElement.addMeta("createDate", new Date().toLocaleDateString())
    createdElement.addMeta("createTime", new Date().getTime().toLocaleString())

    document.getElementById("currentDir").innerText = currentDir.getFullRoute() + ">"
}

function createFileByFullPath(route,name, type) {
    let currDir = createDirByFullPath(route)
    let file = new mkfile(name, type, {}, currDir)
    currDir.addChild(file)

    return file
}

function createFileByRelativePath(route,name, type) {
    let currDir = createDirByRelativePath(route)
    let file = new mkfile(name, type, {}, currDir)
    currDir.addChild(file)

    return file
}

function createDirByFullPath(route) {
    let splittedRoute = route.split("\\")
    let step = 0;
    let dirToFind
    let currDir = root

    if ((route === "C:" || route === "C:\\")) {
        return root
    }

    while(step !== splittedRoute.length - 1) {
        dirToFind = splittedRoute[step + 1]

        if (currDir.getChildren().find(x => x.getName() === dirToFind) !== undefined) {
            currDir = currDir.getChildren().find(x => x.getName() === dirToFind)
        } else {
            currDir.addChild(new mkdir(dirToFind, "directory", {}, [], currDir))
            step -= 1
        }

        step += 1
    }

    return currDir
}

function createDirByRelativePath(route) {
    let splittedRoute = route.split("\\")
    let step = 0;
    let dirToFind
    let currDir = currentDir

    if (splittedRoute[0] === "") {
        return currentDir
    }

    if ((route === "C:" || route === "C:\\")) {
        return 0
    }

    while(step !== splittedRoute.length) {
        dirToFind = splittedRoute[step]

        if (currDir.getChildren().find(x => x.getName() === dirToFind) !== undefined) {

            currDir = currDir.getChildren().find(x => x.getName() === dirToFind)
        } else {
            currDir.addChild(new mkdir(dirToFind, "directory", {}, [], currDir))
            step -= 1
        }

        step += 1
    }

    return currDir
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
        "0": "rgb(21, 31, 20)",
        "1": "rgb(0, 55, 218)",
        "2": "rgb(20, 253, 206)",
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
    let colorsRGBA = {
        "0": "rgba(21, 31, 20, 0.5)",
        "1": "rgba(0, 55, 218, 0.5)",
        "2": "rgba(20, 253, 206, 0.5)",
        "3": "rgba(58, 150, 221, 0.5)",
        "4": "rgba(197, 15, 31, 0.5)",
        "5": "rgba(136, 23, 152, 0.5)",
        "6": "rgba(193, 156, 0, 0.5)",
        "7": "rgba(204, 204, 204, 0.5)",
        "8": "rgba(118, 118, 118, 0.5)",
        "9": "rgba(59, 120, 255, 0.5)",
        "a": "rgba(22, 198, 12, 0.5)",
        "b": "rgba(97, 214, 214, 0.5)",
        "c": "rgba(231, 72, 86, 0.5)",
        "d": "rgba(180, 0, 158, 0.5)",
        "e": "rgba(249, 241, 165, 0.5)",
        "f": "rgba(242, 242, 242, 0.5)",
    }

    // Я думаю, тут код можно упростить, но мне лень.
    let root = document.querySelector(':root');
    if (val.split(' ').length === 1) {
        root.style.setProperty("--background-color", colors["0"]);
        root.style.setProperty("--text-color", "white");
        root.style.setProperty("--text-color-rgba", "white");

    } else if (val.split(' ').length > 1) {
        let inputColors = val.split(' ')[1].toLowerCase();
        if (inputColors.length === 1) {
            let textColor = inputColors;
            if (colors.hasOwnProperty(textColor.toLowerCase())) {
                root.style.setProperty("--text-color", colors[textColor]);
                root.style.setProperty("--text-color-rgba", colorsRGBA[textColor]);
                root.style.setProperty("--background-color", colors["0"]);
            }
        }
        else if (inputColors.length < 3) {
            let bgColor = inputColors[0];
            let textColor = inputColors[1];
            if (colors.hasOwnProperty(bgColor.toLowerCase()) && colors.hasOwnProperty(textColor.toLowerCase())) {
                root.style.setProperty("--text-color", colors[textColor]);
                root.style.setProperty("--text-color-rgba", colorsRGBA[textColor]);
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