// electron 主进程文件
import { app, BrowserWindow } from 'electron'
app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // 可以在渲染进程中使用node api  为了安全 默认是不允许的
            contextIsolation: false, // 关闭渲染进程沙箱
            webSecurity: false, // 关闭同源策略
        },
    })
    win.webContents.openDevTools()
    console.log(process.argv[2], 'process.argv');
    if (process.argv[2]) {
        win.loadURL(process.argv[2]) // 开发环境 进程传参传递过来的
    } else {
        win.loadFile('index.html') // 生产环境
        
    }
})