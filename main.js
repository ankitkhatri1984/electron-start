const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const fs = require("fs");
const https = require('https');
var schedule = require('node-schedule');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function checkifAutoEnableAndAutoUpdate(){
   getPreferenceAndAutoUpdate();
  
}

function getPreferenceAndAutoUpdate(){
  let jsondata = {};
  https.get('https://testapi.io/api/ankitkhatri1984/autoUpdate', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data).explanation);
    jsondata = JSON.parse(data);
    if(jsondata.autoUpdate){
      console.log("checking for updates and notify");
      autoUpdater.checkForUpdatesAndNotify();
      autoUpdater.autoInstallOnAppQuit = true;
      
    } else {
      console.log("autoupdate set to false");
    }
    
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

}

app.on('ready', () => {
  createWindow();
  console.log("create window executed and running for  checking for update");
  var event = schedule.scheduleJob("*/1 * * * *", function() {
    console.log('This runs every 5 minutes');
    checkifAutoEnableAndAutoUpdate();
});
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    autoUpdater.quitAndInstall(true,false);
    app.quit();
  }
});

app.on('before-quit', function () {
    autoUpdater.quitAndInstall(true);
    autoUpdater.install
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('app_version', (event) => {
  event.sender.send('app_version', { version: app.getVersion()});
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});
autoUpdater.on('update-not-available', () => {
  console.log("updates are not available.");
  mainWindow.webContents.send('update_not_available');
});
autoUpdater.on('error', () => {
  console.log("error");
  mainWindow.webContents.send('error');
});

autoUpdater.on('checking-for-update', () => {
  console.log("checking-for-update");
  mainWindow.webContents.send('checking_for_update');
});



