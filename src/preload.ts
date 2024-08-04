import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('backend', {
    send: (channel: string, ...data: any[]) => ipcRenderer.send(channel, data),
    // @ts-ignore
    receive: (channel: string, func: (...args: any[]) => void) => ipcRenderer.on(channel, (event, ...args) => func(...args))
})

console.log('preload.ts loaded')
