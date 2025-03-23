
const electron = require('electron');

electron.contextBridge.exposeInMainWorld('test', {
    function1: () => console.log("Porcodio"),
    value1: 42
});