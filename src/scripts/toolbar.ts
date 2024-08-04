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

    manageNavigationButtons();
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

function sendToBackend(message: string) 
{
    // @ts-ignore
    window.backend.send(message);
}

function manageNavigationButtons()
{
    // @ts-ignore
    window.backend.send('check-nav-state');

    // @ts-ignore
    window.backend.receive('result-nav-state', (result: { canGoBack: boolean, canGoForward: boolean }) =>
    {
        const goBackButton = document.getElementById('button-goback') as HTMLButtonElement;
        const goForwardButton = document.getElementById('button-goforward') as HTMLButtonElement;

        if (goBackButton && goForwardButton)
        {
            goBackButton.disabled = !result.canGoBack;
            goForwardButton.disabled = !result.canGoForward;

            if (result.canGoBack)
            {
                goBackButton.classList.remove('dead-button');
                goBackButton.classList.add('alive-button');
            }
            else
            {
                goBackButton.classList.add('dead-button');
                goBackButton.classList.remove('alive-button');
            }

            if (result.canGoForward)
            {
                goForwardButton.classList.remove('dead-button');
                goForwardButton.classList.add('alive-button');
            }
            else
            {
                goForwardButton.classList.add('dead-button');
                goForwardButton.classList.remove('alive-button');
            }
        }
    });
}
