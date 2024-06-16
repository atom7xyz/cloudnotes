
window.addEventListener('DOMContentLoaded', () =>
{
    bindClickEvent('button-minimize', () => {
        sendToBackend("minimize")
    });

    bindClickEvent('button-fullscreen', () => {
        sendToBackend("resize")
    });

    bindClickEvent('button-close', () => {
        sendToBackend("close")
    });

    bindClickEvent('button-reload', () => {
        sendToBackend("reload")
    });

    bindClickEvent('button-goback', () => {
        sendToBackend("goback")
    });

    bindClickEvent('button-goforward', () => {
        sendToBackend("goforward")
    });
})

function bindClickEvent(from: string, callback: () => void)
{
    bindEvent(from, 'click', callback);
}

function bindEvent(from: string, event: string, callback: () => void)
{
    const element = document.getElementById(from);

    if (element != null)
    {
        element.addEventListener(event, callback);
    }
}

function sendToBackend(message: string) {
    // @ts-ignore
    window.backend.send(message)
}