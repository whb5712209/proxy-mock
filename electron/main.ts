import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as url from "url";
import getListen from './listen/http';

declare var global: NodeJS.Global & typeof globalThis & {
  mainWindow: BrowserWindow | null;
};


let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      enableRemoteModule: true
    },
  });

  if (process.env.NODE_ENV === "development") {
     mainWindow.loadURL(`http://localhost:4000/main`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true,
      })
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  getListen(mainWindow)
}

app.on("ready", createWindow);


app.allowRendererProcessReuse = true;
