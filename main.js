// Sets variables (const)
const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  globalShortcut,
  clipboard
} = require('electron')
const path = require('path')

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let translationWindows = [{
    id: 'deepl',
    url: 'https://www.deepl.com/translator',
    clipboardUrl: 'https://www.deepl.com/translator#en/de/###clipboard###'
  },
  {
    id: 'google',
    url: 'https://translate.google.de/#view=home&op=translate&sl=auto&tl=de&text=',
    clipboardUrl: 'https://translate.google.de/#view=home&op=translate&sl=auto&tl=de&text=###clipboard###'
  },
  {
    id: 'linguee',
    url: 'https://www.linguee.com/',
    clipboardUrl: 'https://www.linguee.com/english-german/search?source=auto&query=###clipboard###'
  },
]
let controlsWindow = undefined
let activeWindowID = translationWindows[0].id


// Don't show the app in the doc
// app.dock.hide()

// Creates tray & window
app.on('ready', () => {
  createTray()
  createWindow()

  globalShortcut.register('CommandOrControl+Alt+T', () => {
    toggleWindow()
  })

  globalShortcut.register('CommandOrControl+Alt+Shift+T', () => {
    translationWindows.forEach(window => {
      window.browserWindow.loadURL(window.clipboardUrl.replace('###clipboard###', clipboard.readText()))
    })
    toggleWindow()
  })

})

app.dock.hide();

ipcMain.on('controls-set-active-windows', (event, id) => {
  activeWindowID = id
  showWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
  app.quit()
})

// Creates tray image & toggles window on click
const createTray = () => {
  tray = new Tray(path.join(assetsDirectory, 'icons/icon.png'))
  tray.addListener('click', () => {
    toggleWindow()
  })
}

const getWindowPosition = (window) => {
  const windowBounds = window.getBounds()
  const trayBounds = tray.getBounds()

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))

  // Position window 4 pixels vertically below the tray icon
  const y = Math.round(trayBounds.y + trayBounds.height + 3)

  return {
    x: x,
    y: y
  }
}

// Creates window & specifies its values
const createWindow = () => {
  controlsWindow = new BrowserWindow({
    width: 720,
    height: 55,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    alwaysOnTop: true,
    icon: path.join(assetsDirectory, 'icons/icon.png'),
    webPreferences: {
      nodeIntegration: true
    }
  })

  controlsWindow.setMenuBarVisibility(false)
  
  translationWindows.forEach(window => {
    window.browserWindow = new BrowserWindow({
      width: 720,
      height: 400,
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: false,
      hasShadow: false,
      alwaysOnTop: true,
      icon: path.join(assetsDirectory, 'icons/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    window.browserWindow.loadURL(window.url)
  });


  controlsWindow.loadFile('controls.html')
  // window.webContents.openDevTools();

  // Hide the window when it loses focus
  // window.on('blur', () => {
  //   if (!window.webContents.isDevToolsOpened()) {
  //     window.hide()
  //   }
  // })
}

const toggleWindow = () => {
  if (controlsWindow.isVisible()) {
    translationWindows.forEach(window => {
      window.browserWindow.hide()
    })
    controlsWindow.hide()
  } else {
    showWindow()
  }
}

const showWindow = () => {
  let position, windowBounds

  translationWindows.forEach(window => {
    if (window.id === activeWindowID) {
      position = getWindowPosition(window.browserWindow)
      windowBounds = window.browserWindow.getBounds()
      window.browserWindow.setPosition(position.x, position.y, false)
      window.browserWindow.show()
      window.browserWindow.focus()
    }
  })

  controlsWindow.setPosition(position.x, position.y + windowBounds.height - 20, false)
  controlsWindow.show()
}