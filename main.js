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

    // if application clicked and no windows open, open a window
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// if not on mac, quit when all windows closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})