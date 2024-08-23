window.addEventListener('DOMContentLoaded', () =>
{
    handleDestructiveModals();
    
    handleSuccessModals();
    handleFailedModals();

    handleOtherModals();
});

function handleDestructiveModals()
{
    document.addEventListener('open-destructive', (event) => 
    {
        // @ts-ignore
        createDestructiveModal('destructive-modal', event.detail.ok, event.detail.cancel);
    });

    document.addEventListener('close-destructive', () => 
    {
        removeModal('destructive-modal')
    });

    /*
     * Destructive modals on hrefs. 
     */

    const resendCode = document.getElementById('resend-code') as HTMLButtonElement;
    
    bindClickEvent(document.body, (event) => 
    {
        const target = event.target as HTMLElement;

        if (!(target instanceof HTMLAnchorElement) || resendCode)
        { 
            return;
        }

        const href = target.href.toString();

        if (href.startsWith('mailto') || href.startsWith('tel'))
        {
            return;
        }

        handleDestructiveModalClick(event, 'navigate', href);
    });
}

function handleSuccessModals()
{
    document.addEventListener('open-success', (event) =>
    {
        // @ts-ignore
        createWarningModal(ModalType.Success, 'success-modal', event.detail.ok);
    });

    document.addEventListener('close-success', () =>
    {
        removeModal('success-modal');
    });

    /* 
     * Resend code modal. (pw-recovery-code.html)
     */

    const resendCode = document.getElementById('resend-code') as HTMLButtonElement;

    bindClickEvent(resendCode, (event) => 
    {
        event.preventDefault();
        clearAllForms();

        createLoadingModal('Resending code ...', () =>
        {
            createWarningModal(ModalType.Success, 'We sent a new code to your email.' 
                                                    + '<br>Please check your inbox.');
        });
    });
}

function handleFailedModals()
{
    document.addEventListener('open-failed', (event) =>
    {
        // @ts-ignore
        createWarningModal(ModalType.Failed, 'failed-modal', event.detail.ok);
    });

    document.addEventListener('close-failed', () =>
    {
        removeModal('failed-modal');
    });

    bindClickEvent(document.body, () => 
    {

    });
}

function handleOtherModals()
{
    document.addEventListener('validation-completed', (event) =>
    {
        let messageChosen = getRandomMessage(randomMessages);

        createLoadingModal(messageChosen, () =>
        {
            // @ts-ignore
            const form = event.detail.form as HTMLFormElement;
            form.submit();
        });
    });

    document.addEventListener('open-settings', () => 
    {
                
    });

    document.addEventListener('close-settings', () => 
    {
        removeModal('settings-modal');
    });

    document.addEventListener('open-search', () => {});

    document.addEventListener('close-search', () => 
    {
        removeModal('search-modal');
    });
}

const excludedPagesModal = [ 'terms-of-service.html' ];

function isPageExcludedModal(href: string | null): boolean
{
    if (!href)
    {
        return false;
    }

    return excludedPagesModal.some((page) => href.includes(page));
}

async function handleDestructiveModalClick(event: MouseEvent, action: string, href: string | null = null)
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


/*
 * Loading Modals
 */

const randomMessages = [ 'Getting ready ...', 'Loading ...', 'Please wait ...', 'Almost there ...', 'Just a moment ...'];

function createLoadingModal(message: string, afterTimeout: () => void, timeout: number = 3000)
{
    const modal = document.createElement('div');
    modal.id = 'spinner-container';
    modal.classList.add('overlay');

    const boxContainer = document.createElement('div');
    boxContainer.classList.add('load-container');

    const box = document.createElement('div');
    box.classList.add('load-box');

    const spinner = document.createElement('div');
    spinner.classList.add('load-spinner');

    const p = document.createElement('p');

    if (message.includes('<br>'))
    {
        const messageParts = message.split('<br>');
        messageParts.forEach((part) =>
        {
            const sp = document.createElement('span');
            sp.textContent = part;
            p.appendChild(sp);
            p.appendChild(document.createElement('br'));
        });
    }
    else
    {
        p.textContent = message;
    }

    box.appendChild(spinner);
    box.appendChild(p);
    boxContainer.appendChild(box);
    modal.appendChild(boxContainer);

    document.body.appendChild(modal);

    setTimeout(() => 
    {
        afterTimeout();
        removeModal('spinner-container');
    }, timeout);
}

function createDestructiveModal(message: string,
                                ok: () => void, cancel: () => void,
                                okButtonName: string = 'Proceed', cancelButtonName: string = 'Cancel', 
                                action: string = 'Action Required')
{
    const modal = document.createElement('div');
    modal.id = 'destructive-modal';
    modal.classList.add('overlay');

    const boxContainer = document.createElement('div');
    boxContainer.classList.add('destructive-container');

    const box = document.createElement('div');
    box.classList.add('destructive-box');

    const h2 = document.createElement('h2');
    h2.textContent = action;

    const p = document.createElement('p');
    
    if (message.includes('<br>'))
    {
        const messageParts = message.split('<br>');
        messageParts.forEach((part) =>
        {
            const sp = document.createElement('span');
            sp.textContent = part;
            p.appendChild(sp);
            p.appendChild(document.createElement('br'));
        });
    }
    else
    {
        p.textContent = message;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('destructive-buttons');

    const okButton = document.createElement('button');
    okButton.textContent = okButtonName;
    okButton.classList.add('ok-button');
    bindClickEvent(okButton, () =>
    {
        ok();
        removeModal('destructive-modal');
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = cancelButtonName;
    cancelButton.classList.add('cancel-button');
    bindClickEvent(cancelButton, () =>
    {
        cancel();
        removeModal('destructive-modal');
    });

    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);

    box.appendChild(h2);
    box.appendChild(p);
    box.appendChild(buttonContainer);
    boxContainer.appendChild(box);
    modal.appendChild(boxContainer);

    document.body.appendChild(modal);
}

enum ModalType
{
    Success,
    Failed
};

function createWarningModal(type: ModalType, 
                            message: string, 
                            ok: () => void  = () => {}, okButtonName: string = 'OK', 
                            action: string = 'Success')
{
    let classContainer = 'action-success-container';
    let classBox = 'action-success-box';
    let classButtons = 'action-success-buttons';

    if (type === ModalType.Failed)
    {
        classContainer = 'action-failed-container';
        classBox = 'action-failed-box';
        classButtons = 'action-failed-buttons';
    }

    const modal = document.createElement('div');
    modal.id = 'success-modal';
    modal.classList.add('overlay');

    const boxContainer = document.createElement('div');
    boxContainer.classList.add(classContainer);

    const box = document.createElement('div');
    box.classList.add(classBox);

    const h2 = document.createElement('h2');
    h2.textContent = action;

    const p = document.createElement('p');
    
    if (message.includes('<br>'))
    {
        const messageParts = message.split('<br>');
        messageParts.forEach((part) =>
        {
            const sp = document.createElement('span');
            sp.textContent = part;
            p.appendChild(sp);
            p.appendChild(document.createElement('br'));
        });
    }
    else
    {
        p.textContent = message;
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add(classButtons);

    const okButton = document.createElement('button');
    okButton.classList.add('ok-button');
    okButton.textContent = okButtonName;

    bindClickEvent(okButton, () =>
    {
        ok();
        removeModal('success-modal');
    });

    buttonContainer.appendChild(okButton);

    box.appendChild(h2);
    box.appendChild(p);
    box.appendChild(buttonContainer);
    boxContainer.appendChild(box);
    modal.appendChild(boxContainer);

    document.body.appendChild(modal);
}

function createSettingsModal()
{
    
}

function removeModal(modalId: string): boolean 
{
    const modal = document.getElementById(modalId);

    if (modal) 
    {
        document.body.removeChild(modal);
    }

    return modal ? true : false;
}

function openMainMenu() {
    let mm = document.getElementById('main-menu');
    if (mm) {
        mm.style.left = mm.offsetLeft === 0 ? ('-'+mm.offsetWidth+'px') : '0px';
    }
}