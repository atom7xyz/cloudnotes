window.addEventListener('DOMContentLoaded', () =>
{
    document.addEventListener('validation-completed', (event) =>
    {
        let messageChosen = getRandomMessage(randomMessage);

        createLoadingModal(messageChosen, () =>
        {
            // @ts-ignore
            const form = event.detail.form as HTMLFormElement;
            form.submit();
        });
    });

    document.addEventListener('open-destructive', (event) => 
    {
        // @ts-ignore
        createDestructiveModal('destructive-modal', event.detail.ok, event.detail.cancel);
    });

    document.addEventListener('close-destructive', () => 
    {
        removeModal('destructive-modal')
    });

    document.addEventListener('open-settings', () => {}); 

    document.addEventListener('open-search', () => {});
});

/*
 * Loading Modals
 */

const randomMessage = [ 'Getting ready ...', 'Loading ...', 'Please wait ...', 'Almost there ...', 'Just a moment ...'];

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
    p.textContent = message;

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
                                okButtonName: string = 'OK', cancelButtonName: string = 'Cancel')
{
    const modal = document.createElement('div');
    modal.id = 'destructive-modal';
    modal.classList.add('overlay');

    const boxContainer = document.createElement('div');
    boxContainer.classList.add('destructive-container');

    const box = document.createElement('div');
    box.classList.add('destructive-box');

    const p = document.createElement('p');
    p.textContent = message;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('destructive-buttons');

    const okButton = document.createElement('button');
    okButton.textContent = okButtonName;
    okButton.classList.add('ok-button');
    okButton.addEventListener('click', () =>
    {
        ok();
        removeModal('destructive-modal');
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = cancelButtonName;
    cancelButton.classList.add('cancel-button');
    cancelButton.addEventListener('click', () =>
    {
        cancel();
        removeModal('destructive-modal');
    });

    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);

    box.appendChild(p);
    box.appendChild(buttonContainer);
    boxContainer.appendChild(box);
    modal.appendChild(boxContainer);

    document.body.appendChild(modal);
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
