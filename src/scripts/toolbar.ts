window.addEventListener('DOMContentLoaded', () =>
{
    bindClickEvent('button-minimize', () =>
    {
        sendToBackend("minimize");
    });

    bindClickEvent('button-fullscreen', () => 
    {
        sendToBackend("resize");
    });

    bindClickEvent('button-close', () => 
    {
        checkFormsAndSendModal(() => sendToBackend("close"));
    });

    bindClickEvent('button-reload', () => 
    {
        checkFormsAndSendModal(() => sendToBackend("reload"));
    });

    bindClickEvent('button-goback', () => 
    {
        checkFormsAndSendModal(() => sendToBackend("goback"));
    });

    bindClickEvent('button-goforward', () => 
    {
        checkFormsAndSendModal(() => sendToBackend("goforward"));
    });

    manageNavigationButtons();

    const excludedPages = [ 'terms-of-service.html' ];

    bindClickEvent(document.body, (event) => 
    {
        const target = event.target as HTMLElement;

        if (target instanceof HTMLAnchorElement)
        {
            const href = target.href.toString();

            if (href.startsWith('mailto') || href.startsWith('tel'))
            {
                return;
            }

            if (excludedPages.some((page) => href.includes(page)))
            {
                return;
            }
                
            event.preventDefault();

            checkFormsAndSendModal(() => 
            {
                sendToBackend("navigate", href);
            });
        }
    });
});

function checkFormsAndSendModal(okAction: () => void)
{
    if (!isThereAnyForm() || !isFormPartiallyFilled())
    {
        okAction();
        return;
    }
    
    createDestructiveModal('You have unsaved changes. Do you want to discard them?',
    () => // ok
    {
        console.log('Discarding changes');
        okAction();
    }, 
    () => // cancel
    {
        console.log('Cancelled');
    });
}

function manageNavigationButtons()
{
    sendToBackend('check-nav-state');

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
