const electron = require('electron')
const {
    app,
    BrowserWindow,
    ipcMain
} = electron;

let os = require('os')
const fs = require('fs-extra')
const path = require('path')

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

// require('electron-reload')(__dirname, {
//     electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
// });

let win;

function createWin() {
    win = new BrowserWindow({
        title: "MangaViewer",
        height: 600,
        width: 1100,
        minHeight: 400,
        minWidth: 740,
        show: false,
        transparent: true,
        frame: false,
        webPreferences: { nodeIntegration: true }
    });

    win.setMenu(null);

    win.loadURL('file://' + __dirname + '/index.html');

    win.on('ready-to-show', () => {
        win.show();
    });


    win.on('close', () => {
        app.quit();
    });

    //This is used in mac for recreate the window
    app.on('active', () => {
        if (win === null) {
            createWin();
        }
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    electron.powerMonitor.on('suspend', () => {
        win.webContents.send('suspend');
    });
    electron.powerMonitor.on('resume', () => {
        win.webContents.send('resume');
    });
    electron.powerMonitor.on('shutdown', () => {
        win.webContents.send('shutdown');
    });
}
ipcMain.on('log', (event, msg) => {
    console.log(msg);
});

app.commandLine.appendSwitch("--disable-http-cache");

app.on('close', () => {
    win = null;
});
//Create the window when electron is ready
app.on('ready', createWin);

app.setPath('userData', path.join(os.homedir(), '.MangaDownloader'));

var dbPath = path.join(os.homedir(), './.mangas-common/');
if (!fs.existsSync(dbPath)) {
    fs.mkdirsSync(dbPath);
}

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};