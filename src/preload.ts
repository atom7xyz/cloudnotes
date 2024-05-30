import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('backend', {
    send: (channel: string, ...data: any[]) => ipcRenderer.send(channel, data)
})

console.log('preload.ts loaded')



