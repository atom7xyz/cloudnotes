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
        createSettingsModal();
    });

    document.addEventListener('close-settings', () => 
    {
        removeModal('settings-modal');
    });

    document.addEventListener('change-tab', (event) =>
    {
        // @ts-ignore
        settingsColorTab(event.detail)
        // @ts-ignore
        settingsPutContent(event.detail);
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

function createConfirmActionWithPasswordModal(message: string,
                                                ok: () => void, cancel: () => void,
                                                okButtonName: string = 'Proceed', cancelButtonName: string = 'Cancel', 
                                                action: string = 'Authentication Required')
{
    const modal = document.createElement('div');
    modal.id = 'confirm-action-modal';
    modal.classList.add('overlay');

    const boxContainer = document.createElement('div');
    boxContainer.classList.add('confirm-action-container');

    const box = document.createElement('div');
    box.classList.add('confirm-action-box');

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

    const inputContainer = document.createElement('div');
    inputContainer.classList.add('confirm-action-input');

    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Enter your password';

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('confirm-action-buttons');

    const okButton = document.createElement('button');
    okButton.textContent = okButtonName;
    okButton.classList.add('ok-button');
    bindClickEvent(okButton, () =>
    {
        ok();
        removeModal('confirm-action-modal');
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = cancelButtonName;
    cancelButton.classList.add('cancel-button');
    bindClickEvent(cancelButton, () =>
    {
        cancel();
        removeModal('confirm-action-modal');
    });

    inputContainer.appendChild(input);
    buttonContainer.appendChild(okButton);
    buttonContainer.appendChild(cancelButton);

    box.appendChild(h2);
    box.appendChild(p);
    box.appendChild(inputContainer);
    box.appendChild(buttonContainer);
    boxContainer.appendChild(box);
    modal.appendChild(boxContainer);

    document.body.appendChild(modal);
}

enum SettingsTab {
    Account,
    Appearance,
    Reader,
    Language,
    Notifications
};

const settingsTabs = [
    'Account', 'Appearance', 'Reader', 'Language', 'Notifications'
];

function createSettingsModal()
{
    const modal = document.createElement('div'); 
    modal.id = 'settings-modal';
    modal.classList.add('overlay');

    const container = document.createElement('div');
    container.classList.add('settings-container');

    const header = document.createElement('div');
    header.classList.add('settings-header');

    const h2 = document.createElement('h2');
    h2.textContent = 'SETTINGS';

    const closeButton = document.createElement('button');
    closeButton.classList.add('settings-close-button', 'filter-white');

    const img = document.createElement('img');
    img.src = '../resources/assets/icons/close.svg';

    closeButton.appendChild(img);
    header.appendChild(h2);
    header.appendChild(closeButton);

    const body = document.createElement('div');
    body.classList.add('settings-body');

    const tabs = document.createElement('div');
    tabs.classList.add('settings-tabs');

    settingsTabs.forEach((name) =>
    {
        const tab = document.createElement('button');
        tab.classList.add('tab');
        tab.textContent = name;
        tabs.appendChild(tab);
    });

    const hr = document.createElement('hr');

    const content = document.createElement('div');
    content.classList.add('settings-content');

    body.appendChild(tabs);
    body.appendChild(hr);
    body.appendChild(content);

    container.appendChild(header);
    container.appendChild(body);

    modal.appendChild(container);
    document.body.appendChild(modal);
}

function settingsPutContent(content: SettingsTab)
{
    const contentDiv = document.querySelector('.settings-content') as HTMLElement;

    if (!contentDiv)
    {
        return;
    }

    contentDiv.innerHTML = ''; 

    switch (content)
    {
        case SettingsTab.Account:
            settingsPutAccount();
            break;
        case SettingsTab.Appearance:
            settingsPutAppearance();
            break;
        case SettingsTab.Reader:
            break;
        case SettingsTab.Language:
            settingsPutLanguage();
            break;
        case SettingsTab.Notifications:
            settingsPutNotifications();
            break;
    }
}

function settingsPutNotifications()
{
    const notificationSettings = [ 
        'Feedback Notifications', 'Document Update Notifications', 'Application Update Notifications' 
    ];

    const notificationDescriptions = [ 
        'You will receive a notification when a user leaves feedback on your documents.',
        'You will receive a notification when a document you have access to has been updated by the publisher.',
        'You will receive a notification when a new version of the application is available, '
            + 'along with a recap of the changes that have been made.' 
    ];

    const content = document.querySelector('.settings-content') as HTMLElement;

    if (!content)
    {
        return;
    }

    notificationSettings.forEach((item, index) =>
    {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('settings-item');

        const label = document.createElement('label');
        label.textContent = item;

        const switchLabel = document.createElement('label');
        switchLabel.classList.add('switch');

        const input = document.createElement('input');
        input.type = 'checkbox';

        const span = document.createElement('span');
        span.classList.add('slider', 'round');

        switchLabel.appendChild(input);
        switchLabel.appendChild(span);

        itemDiv.appendChild(label);
        itemDiv.appendChild(switchLabel);

        const description = document.createElement('div');
        description.classList.add('settings-item-description');

        const descLabel = document.createElement('label');
        descLabel.textContent = notificationDescriptions[index];

        description.appendChild(descLabel);

        content.appendChild(itemDiv);
        content.appendChild(description);
    });
}

function settingsPutLanguage()
{
    const content = document.querySelector('.settings-content') as HTMLElement;

    if (!content)
    {
        return;
    }

    const languageSettings = [ 
        'Application Language', 'Preferred Document Language' 
    ];

    const languageDescriptions = [ 
        'Choose the language you would like to use for the application.', 
        'Choose the language you would like to read documents in.'
    ];

    languageSettings.forEach((item, index) =>
    {
        const selectContainer = document.createElement('div');
        selectContainer.classList.add('select-container');

        const label = document.createElement('label');
        label.textContent = item;

        const select = document.createElement('select');

        const languages = [ 
            '🇺🇸 English', '🇮🇹 Italiano', '🇫🇷 Française', '🇩🇪 Deutsch', '🇪🇸 Español', '🇷🇺 Pусский' 
        ];

        languages.forEach((language) =>
        {
            const option = document.createElement('option');
            option.value = language.toLowerCase();
            option.textContent = language;

            select.appendChild(option);
        });

        selectContainer.appendChild(label);
        selectContainer.appendChild(select);

        const description = document.createElement('div');
        description.classList.add('settings-item-description');

        const descLabel = document.createElement('label');
        descLabel.textContent = languageDescriptions[index];

        description.appendChild(descLabel);

        content.appendChild(selectContainer);
        content.appendChild(description);
    }); 
}

function settingsPutAppearance()
{
    const content = document.querySelector('.settings-content') as HTMLElement;

    if (!content)
    {
        return;
    }

    const appearanceSettings = [ 
        'Application Theme' 
    ];

    const appearanceDescriptions = [ 
        'Choose the theme you would like to use for the application.' 
    ];

    const selectContainer = document.createElement('div');
    selectContainer.classList.add('select-container');

    const label = document.createElement('label');
    label.textContent = appearanceSettings[0];
    
    const select = document.createElement('select');

    const darkMode = document.createElement('option');
    darkMode.value = 'dark';
    darkMode.textContent = '🌚 Dark Theme';

    const lightMode = document.createElement('option');
    lightMode.value = 'light';
    lightMode.textContent = '🌝 Light Theme';

    select.appendChild(darkMode);
    select.appendChild(lightMode);

    selectContainer.appendChild(label);
    selectContainer.appendChild(select);

    const description = document.createElement('div');
    description.classList.add('settings-item-description');

    const descLabel = document.createElement('label');
    descLabel.textContent = appearanceDescriptions[0];

    description.appendChild(descLabel);
    
    content.appendChild(selectContainer);
    content.appendChild(description);
}

function settingsPutAccount()
{
    const content = document.querySelector('.settings-content') as HTMLElement;

    if (!content)
    {
        return;
    }

    const accountSettings = [
        'Change Email', 'Change Password', 'Delete Account'
    ];

    const accountDescriptions = [
        'Change the email address used to log into your account.',
        'Change the password used to log into your account.',
        'Permanently delete your account along with all your data and documents.'
    ];

    let isDeleteAccount = false;

    accountSettings.forEach((item, index) =>
    {
        isDeleteAccount = item === 'Delete Account';

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('action-container');

        if (isDeleteAccount)
        {
            itemDiv.id = 'delete-account-container';
        }

        const label = document.createElement('label');
        label.textContent = item;

        const clickableButton = document.createElement('button');
        clickableButton.classList.add('settings-button');
        clickableButton.textContent = item;

        if (isDeleteAccount)
        {
            label.id = 'delete-account-label';
            clickableButton.id = 'delete-account-button';
        }

        bindClickEvent(clickableButton, () =>
        {
            if (isDeleteAccount)
            {
                createDestructiveModal('Account Deletion is a permanent action.<br>'
                                        + 'You will lose all your data and documents.<br>'
                                        + 'Are you sure you want to proceed?',
                () => // ok
                {
                    createLoadingModal('Loading ...', 
                    () =>
                    {
                        createConfirmActionWithPasswordModal('Please enter your password to confirm your account deletion.',
                        () =>
                        {
                            createLoadingModal('Deleting account ...', 
                            () =>
                            {
                                createWarningModal(ModalType.Success, 'Account deleted successfully.', 
                                () =>
                                {
                                    let target = window.location.href.split('/').slice(0, -1).join('/');
                                    sendToBackend('navigate', target + '/register.html');
                                });
                            });
                        },
                        () =>
                        {
                            createWarningModal(ModalType.Failed, 'Account deletion cancelled.'); 
                        });
                    });
                }, 
                () => // cancel
                {
                    console.log('Cancelled');
                });
            }
            
            if (item === 'Change Email')
            {
                createWarningModal(ModalType.Success, 'Email changed successfully.');
            }

            if (item === 'Change Password')
            {
                createWarningModal(ModalType.Success, 'Password changed successfully.');
            }
        });

        itemDiv.appendChild(label);
        itemDiv.appendChild(clickableButton);

        const description = document.createElement('div');
        description.classList.add('settings-item-description');

        const descLabel = document.createElement('label');
        descLabel.textContent = accountDescriptions[index];

        description.appendChild(descLabel);

        content.appendChild(itemDiv);
        content.appendChild(description);
    });
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
