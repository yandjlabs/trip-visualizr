const { app, BrowserWindow } = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 300,
        height: 515
    })

    win.loadFile('popup.html')
}

app.whenReady().then(() => {
    createWindow()
})