/* eslint-disable no-undef */
const { app, BrowserWindow, ipcMain } = require("electron");
const rpc = require("discord-rich-presence")("647244885203877901");
const gameData = require("./games");

// Testing the ability to auto update the application
const { autoUpdater } = require('electron-updater');

// For the love of god please let there be a better way of handling this
if (require("./installer-events").handleSquirrelEvent(app)) throw false;

let window;

// Used to create the window
function createWindow () {
    window = new BrowserWindow({
        width: 450,
        height: 600,
        resizable: false,
        maximizable: false,
        icon: __dirname + "/icon.png",
        show: false,
        webPreferences: {
            nodeIntegration: true,

        },
    });

    window.setMenu(null);
    window.loadFile('public/index.html');

    window.on("closed", () => {
        window = null;
    });

    window.on("ready-to-show", () => window.show());

    /* Uncomment this section to allow the dev panel to open automatically on unpackaged builds
    if(!app.isPackaged)
        window.openDevTools();
    */
    setIdle();

    // Used to check if there are any updates available, and if so, download them
    
    autoUpdater.checkForUpdatesAndNotify();
}

// Defines the vars that will contain game data
let name;
let customName;
let desc;
let img;
let idle;

// Executes when game data is recieved
ipcMain.on("game", (e, game, status, customGame) => {
    if (status === "") desc = "Online";
    else desc = status.charAt(0).toUpperCase() + status.slice(1);
    name = game;
    customName = customGame;
    setRPC();
});

// Executes when idle data is recieved
ipcMain.on("idle", (e, clicks) => {
    idle = clicks
    setIdle();
});

// Executes when the restart button is clicked
ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

// Sets the presence to idle
function setIdle() {
    if (idle === 16) return rpc.updatePresence({
        details: "Yoshi's Fucking Island",
        state: "ccomign This Sprign",
        largeImageKey: "yfi",
        largeImageText: "he's sitting there.."});
    rpc.updatePresence({
        details: "Home",
        state: "Idle",
        largeImageKey: "switch",
        largeImageText: "Home"
    });
}

// Finds the game image and sets the presence
function setRPC() {
    for (i = 0; i < gameData.length; i++) {
        if (gameData[i].name === name) {
            img = gameData[i].img;
            break;
        }
    }

    rpc.updatePresence({
        details: name === 'Custom' ? customName : name,
        state: desc,
        largeImageKey: img,
        largeImageText: name
    });
}

// Events to listen for
app.on("ready", createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (window === null) createWindow();
});

// Sends the app version from package.json to the main window
ipcMain.on('version', (event) => {
    event.sender.send('version', {version: app.getVersion()});
});


/* TESTING */

// Sends a notification to the main window that an update is available
autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });

// Sends a notification to the main window that the update is downloaded
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });
