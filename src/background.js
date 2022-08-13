'use strict'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path';
import fs from 'fs';
import { emptyDirSync } from 'fs-extra';

var fileExtension = require('file-extension');

const download = require('image-downloader');

var videoshow = require('videoshow')

const ffmpeg = require('fluent-ffmpeg');

const isDevelopment = process.env.NODE_ENV !== 'production'

let ffmpegPath = "";

if (isDevelopment) {
  ffmpegPath = "./ffmpeg/bin/ffmpeg.exe"; 
} else {
  ffmpegPath = path.join(__dirname, "ffmpeg\\bin\\ffmpeg.exe").replace(
    'app.asar',
    'app.asar.unpacked'
  ) 
}

ffmpeg.setFfmpegPath(ffmpegPath);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "Topit'Auto",
    resizable: false,
    center : true,
    autoHideMenuBar: true,
    webPreferences: {
      
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await installExtension(VUEJS3_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.handle("InfoSyst", async () => {
  const os = require('os');
  let Sys = {};
  Sys.version = app.getVersion();
  Sys.electron = process.versions.electron;
  Sys.node = process.versions.node;
  Sys.chrome = process.versions.chrome;
  Sys.os = os.type() + " " + os.release();
  return Sys;
})

ipcMain.handle("getCurrentVersion", async () => {
  return app.getVersion();
})

ipcMain.handle("update?", async () => {
  const window = BrowserWindow.getFocusedWindow();
  return await dialog.showMessageBox(window, {
    title: 'Mise à jour',
    buttons: ['Oui', 'Non'],
    type: 'none',
    message: 'Une nouvelle version est disponible, \nvoulez-vous la téléchargez ?',
    noLink: true
  })
})

ipcMain.handle("noUpdate", async () => {
  const window = BrowserWindow.getFocusedWindow();
  return await dialog.showMessageBox(window, {
    title: 'Mise à jour',
    type: 'none',
    message: 'Aucune nouvelle mise à jour disponible',
  })
})

async function dl(url) {
  const imagePath = path.join(app.getPath('temp'), 'topitauto_temp')
  fs.existsSync(imagePath) || fs.mkdirSync(imagePath);
  emptyDirSync(imagePath);
  let pathUrl = []
  for (let i = 0; i < url.length; i++) {
    await download.image({
        url: url[i].url,
        dest: imagePath
      })
      .then(({
        filename
      }) => {
        pathUrl.push(filename);
      })
      .catch((err) => console.error(err));
  }
  for (let i = 0; i < pathUrl.length; i++) {
    if (fileExtension(pathUrl[i]) != "png" && fileExtension(pathUrl[i]) != "jpg") {
      fs.unlinkSync(pathUrl[i]);
      pathUrl.splice(i, 1);
      if (fileExtension(pathUrl[i]) == "jpg") {
        fs.renameSync(pathUrl[i], pathUrl[i].split(".")[0] + ".png")
        pathUrl[i] = pathUrl[i].split(".")[0] + ".png";
      }
    }
  }
  // for (let i = 0; i < pathUrl.length; i++) {
  //   console.log(pathUrl[i], fileExtension(pathUrl[i]) != "png" && fileExtension(pathUrl[i]) != "jpg"); 
  // }
  return pathUrl
}

ipcMain.handle('download', async (event, url) => {
  const pathUrl = await dl(url);
  return pathUrl;
})

ipcMain.handle('video', async (event, pathUrl, musicPath) => {
  return new Promise((resolve, reject) => {
    var videoOptions = {
      fps: 25,
      loop: 5, // seconds
      transition: true,
      transitionDuration: 1, // seconds
      videoBitrate: 1024,
      videoCodec: 'libx264',
      size: '640x?',
      audioBitrate: '128k',
      audioChannels: 2,
      format: 'mp4',
      pixelFormat: 'yuv420p',
    }
    videoshow(pathUrl, videoOptions)
      .audio(musicPath)
      .save(path.join(app.getPath('videos'), "video.mp4"))
      .on('start', function (command) {
        console.log('ffmpeg process started:', command)
      })
      .on('error', function (err, stdout, stderr) {
        return reject(`Error: ${err} \n ${stderr}`);
      })
      .on('end', function (output) {
        return resolve(output)
      })
  })
})

ipcMain.handle('getMusic', async () => {
  let music = "";
  await dialog.showOpenDialog({
    defaultPath: app.getPath('downloads'),
    filters: [
      { name : 'MP3', extensions: ['mp3'] }
    ]
  })
  .then(
    path => {
      music = path.filePaths[0];
    }
  )
  return music;
})