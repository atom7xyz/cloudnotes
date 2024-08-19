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

    bindClickEvent('button-close', (event) => 
    {
        handleClickModal(event, 'close');
    });

    bindClickEvent('button-reload', (event) => 
    {
        handleClickModal(event, 'reload');
    });

    bindClickEvent('button-goback', (event) => 
    {
        handleClickModal(event, 'goback');
    });

    bindClickEvent('button-goforward', (event) => 
    {
        handleClickModal(event, 'goforward');
    });

    manageNavigationButtons();

    /*
     * Destructive modals on hrefs 
     */

    bindClickEvent(document.body, (event) => 
    {
        const target = event.target as HTMLElement;

        if (!(target instanceof HTMLAnchorElement))
        { 
            return;
        }

        const href = target.href.toString();

        if (href.startsWith('mailto') || href.startsWith('tel'))
        {
            return;
        }

        handleClickModal(event, 'navigate', href);
    });
});

const excludedPagesModal = [ 'terms-of-service.html' ];

function isPageExcludedModal(href: string | null): boolean
{
    if (!href)
    {
        return false;
    }

    return excludedPagesModal.some((page) => href.includes(page));
}

async function handleClickModal(event: MouseEvent, action: string, href: string | null = null)
{
    let toolbarMovement = href === null;
   
    if (href && href.includes('#'))
    {
        return;
    }

    event.preventDefault();
    throwEvent('save-forms', null);

    if (!toolbarMovement && isPageExcludedModal(href))
    {
        sendToBackend(action, href);
        return;
    }
    
    checkFormsAndSendModal(() => 
    {
        clearAllForms();

        if (toolbarMovement)
        {
            sendToBackend(action);
        }
        else
        {
            sendToBackend(action, href);
        }
    });
}

function checkFormsAndSendModal(okAction: () => void)
{
    let formPresent = isThereAnyForm();
    let formFilled = isFormPartiallyFilled();
   
    if (!formPresent || !formFilled)
    {
        okAction();
        return;
    }
    
    createDestructiveModal( 'You have started filling out the form.<br>'
                            + 'Leaving this page will result in losing all entered data.',
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
