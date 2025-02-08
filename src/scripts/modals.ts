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

        if (!(target instanceof HTMLAnchorElement) || resendCode) { 
            return;
        }

        const href = target.href.toString();

        if (href.startsWith('mailto') || href.startsWith('tel')) {
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
    if (!href) {
        return false;
    }

    return excludedPagesModal.some((page) => href.includes(page));
}

async function handleDestructiveModalClick(event: MouseEvent, action: string, href: string | null = null)
{
    let toolbarMovement = href === null;
   
    if (href && href.includes('#')) {
        return;
    }

    event.preventDefault();
    throwEvent('save-forms', null);

    if (!toolbarMovement && isPageExcludedModal(href)) {
        sendToBackend(action, href);
        return;
    }
    
    checkFormsAndSendModal(() => 
    {
        clearAllForms();

        if (toolbarMovement) {
            sendToBackend(action);
        }
        else {
            sendToBackend(action, href);
        }
    });
}

function checkFormsAndSendModal(okAction: () => void)
{
    let formPresent = isThereAnyForm();
    let formFilled = isFormPartiallyFilled();
   
    if (!formPresent || !formFilled) {
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

/**
 * The random messages to display in the loading modal.
 */
const randomMessages = [ 'Getting ready ...', 'Loading ...', 'Please wait ...', 'Almost there ...', 'Just a moment ...'];

/**
 * Creates a loading modal with a message and a spinner.
 * @param loadingMessage The message to display in the modal.
 * @param onLoadComplete The function to call when the modal is loaded.
 * @param loadingDuration The duration of the modal.
 */
function createLoadingModal(loadingMessage: string, onLoadComplete: () => void, loadingDuration: number = 3000)
{
    const loadingModal = document.createElement('div');
    loadingModal.id = 'spinner-container';
    loadingModal.classList.add('overlay');

    const loadingContainer = document.createElement('div');
    loadingContainer.classList.add('load-container');

    const loadingBox = document.createElement('div');
    loadingBox.classList.add('load-box');

    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('load-spinner');

    const messageElement = document.createElement('p');

    if (loadingMessage.includes('<br>'))
    {
        const messageLines = loadingMessage.split('<br>');
        messageLines.forEach((line) =>
        {
            const messageSpan = document.createElement('span');
            messageSpan.textContent = line;
            messageElement.appendChild(messageSpan);
            messageElement.appendChild(document.createElement('br'));
        });
    }
    else
    {
        messageElement.textContent = loadingMessage;
    }

    loadingBox.appendChild(loadingSpinner);
    loadingBox.appendChild(messageElement);
    loadingContainer.appendChild(loadingBox);
    loadingModal.appendChild(loadingContainer);

    document.body.appendChild(loadingModal);

    setTimeout(() => 
    {
        onLoadComplete();
        removeModal('spinner-container');
    }, loadingDuration);
}

/**
 * Creates a destructive modal with a message and two buttons.
 * @param message The message to display in the modal.
 * @param ok The function to call when the OK button is clicked.
 * @param cancel The function to call when the Cancel button is clicked.
 * @param okButtonName The text to display on the OK button.
 * @param cancelButtonName The text to display on the Cancel button.
 * @param action The text to display in the header of the modal.
 */
function createDestructiveModal(message: string,
                                onConfirm: () => void, 
                                onCancel: () => void,
                                confirmButtonText: string = 'Proceed', 
                                cancelButtonText: string = 'Cancel', 
                                modalTitle: string = 'Action Required')
{
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'destructive-modal';
    modalOverlay.classList.add('overlay');

    const modalContainer = document.createElement('div');
    modalContainer.classList.add('destructive-container');

    const modalContent = document.createElement('div');
    modalContent.classList.add('destructive-box');

    const titleElement = document.createElement('h2');
    titleElement.textContent = modalTitle;

    const messageElement = document.createElement('p');
    
    if (message.includes('<br>'))
    {
        const messageLines = message.split('<br>');
        messageLines.forEach((line) =>
        {
            const messageSpan = document.createElement('span');
            messageSpan.textContent = line;
            messageElement.appendChild(messageSpan);
            messageElement.appendChild(document.createElement('br'));
        });
    }
    else
    {
        messageElement.textContent = message;
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('destructive-buttons');

    const confirmButton = document.createElement('button');
    confirmButton.textContent = confirmButtonText;
    confirmButton.classList.add('ok-button');
    bindClickEvent(confirmButton, () =>
    {
        onConfirm();
        removeModal('destructive-modal');
    });

    const cancelButton = document.createElement('button');
    cancelButton.textContent = cancelButtonText;
    cancelButton.classList.add('cancel-button');
    bindClickEvent(cancelButton, () =>
    {
        onCancel();
        removeModal('destructive-modal');
    });

    buttonContainer.appendChild(confirmButton);
    buttonContainer.appendChild(cancelButton);

    const divider = document.createElement('hr');

    modalContent.appendChild(titleElement);
    modalContent.appendChild(messageElement);
    modalContent.appendChild(divider);
    modalContent.appendChild(buttonContainer);
    modalContainer.appendChild(modalContent);
    modalOverlay.appendChild(modalContainer);

    document.body.appendChild(modalOverlay);
}

/**
 * The types of modals available.
 */
enum ModalType
{
    Success,
    Failed
};

/**
 * Creates a warning modal with a message and a confirm button.
 * @param modalType The type of modal to create.
 * @param modalMessage The message to display in the modal.
 * @param onConfirm The function to call when the confirm button is clicked.
 * @param confirmButtonText The text to display on the confirm button.
 * @param modalTitle The title of the modal.
 */
function createWarningModal(modalType: ModalType, 
                            modalMessage: string, 
                            onConfirm: () => void = () => {}, 
                            confirmButtonText: string = 'OK', 
                            modalTitle: string = 'Success')
{
    let modalContainerClass = 'action-success-container';
    let modalBoxClass = 'action-success-box';
    let modalButtonsClass = 'action-success-buttons';

    if (modalType === ModalType.Failed)
    {
        modalContainerClass = 'action-failed-container';
        modalBoxClass = 'action-failed-box';
        modalButtonsClass = 'action-failed-buttons';
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'success-modal';
    modalOverlay.classList.add('overlay');

    const modalContainer = document.createElement('div');
    modalContainer.classList.add(modalContainerClass);

    const modalBox = document.createElement('div');
    modalBox.classList.add(modalBoxClass);

    const titleElement = document.createElement('h2');
    titleElement.textContent = modalTitle;

    const messageElement = document.createElement('p');
    
    if (modalMessage.includes('<br>'))
    {
        const messageLines = modalMessage.split('<br>');
        messageLines.forEach((line) =>
        {
            const messageSpan = document.createElement('span');
            messageSpan.textContent = line;
            messageElement.appendChild(messageSpan);
            messageElement.appendChild(document.createElement('br'));
        });
    }
    else
    {
        messageElement.textContent = modalMessage;
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add(modalButtonsClass);

    const confirmButton = document.createElement('button');
    confirmButton.classList.add('ok-button');
    confirmButton.textContent = confirmButtonText;

    bindClickEvent(confirmButton, () =>
    {
        onConfirm();
        removeModal('success-modal');
    });
    
    buttonContainer.appendChild(confirmButton);

    const divider = document.createElement('hr');

    modalBox.appendChild(titleElement);
    modalBox.appendChild(messageElement);
    modalBox.appendChild(divider);
    modalBox.appendChild(buttonContainer);
    modalContainer.appendChild(modalBox);
    modalOverlay.appendChild(modalContainer);

    document.body.appendChild(modalOverlay);
}

/**
 * The input configurations for the dynamic modal.
 */
type InputConfig = {
    type: string;
    placeholder: string;
    descriptorImageSrc: string;
    inputClasses: string[];
    descriptorButtonClasses: string[];

    togglePasswordId?: string;
    togglePasswordText?: string;
    togglePasswordClasses?: string[];
};

/**
 * Creates a dynamic modal with a message and a form.
 * @param message The message to display in the modal.
 * @param inputConfigs The input configurations for the modal.
 * @param ok The function to call when the OK button is clicked.
 * @param cancel The function to call when the Cancel button is clicked.
 * @param okButtonName The text to display on the OK button.
 * @param cancelButtonName The text to display on the Cancel button.
 * @param action The text to display in the header of the modal.
 */
function createDynamicModal(message: string,
                            inputConfigs: InputConfig[],
                            ok: () => void,
                            cancel: () => void,
                            okButtonName: string = 'Proceed', 
                            cancelButtonName: string = 'Cancel',
                            action: string = 'Action Required')
{
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'confirm-action-modal';
    modalOverlay.classList.add('overlay');

    const modalContainer = document.createElement('div');
    modalContainer.classList.add('confirm-action-container');

    const modalBox = document.createElement('div');
    modalBox.classList.add('confirm-action-box');

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = action;

    const messageContainer = document.createElement('p');
    if (message.includes('<br>'))
    {
        const messageParts = message.split('<br>');
        messageParts.forEach((messagePart) => {
            const messageSpan = document.createElement('span');
            messageSpan.textContent = messagePart;
            messageContainer.appendChild(messageSpan);
            messageContainer.appendChild(document.createElement('br'));
        });
    } 
    else 
    {
        messageContainer.textContent = message;
    }

    const formInputsContainer = document.createElement('div');
    formInputsContainer.classList.add('confirm-action-input');

    inputConfigs.forEach((inputConfig, inputIndex) => 
    {
        const inputWrapper = document.createElement('div');
        inputWrapper.classList.add('input-container');

        const formInput = document.createElement('input');
        formInput.type = inputConfig.type;
        formInput.placeholder = inputConfig.placeholder;
        formInput.required = true;
        inputConfig.inputClasses.forEach((className) => formInput.classList.add(className));

        const inputIconButton = document.createElement('button');
        inputIconButton.type = 'button';
        inputIconButton.tabIndex = -1;
        inputConfig.descriptorButtonClasses.forEach((className) => inputIconButton.classList.add(className));

        const inputIcon = document.createElement('img');
        inputIcon.src = inputConfig.descriptorImageSrc;
        inputIcon.classList.add('filter-gray');

        inputIconButton.appendChild(inputIcon);

        inputWrapper.appendChild(formInput);
        inputWrapper.appendChild(inputIconButton);

        if (inputConfig.type === 'password' && inputConfig.togglePasswordId && inputConfig.togglePasswordText) 
        {
            const passwordToggleButton = document.createElement('button');
            passwordToggleButton.type = 'button';
            passwordToggleButton.id = inputConfig.togglePasswordId;
            passwordToggleButton.tabIndex = -1;
            passwordToggleButton.textContent = inputConfig.togglePasswordText;
            inputConfig.togglePasswordClasses?.forEach((className) => passwordToggleButton.classList.add(className));

            bindClickEvent(passwordToggleButton, () => {
                togglePasswordVisibilityIndex(2 + inputIndex);
            });

            inputWrapper.appendChild(passwordToggleButton);
        }

        formInputsContainer.appendChild(inputWrapper);

        if (inputIndex !== inputConfigs.length - 1) 
        {
            const inputSpacer = document.createElement('br');
            formInputsContainer.appendChild(inputSpacer);
        }
    });

    const modalButtonsContainer = document.createElement('div');
    modalButtonsContainer.classList.add('confirm-action-buttons');

    const confirmButton = document.createElement('button');
    confirmButton.textContent = okButtonName;
    confirmButton.classList.add('ok-button');
    bindClickEvent(confirmButton, () => 
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

    modalButtonsContainer.appendChild(confirmButton);
    modalButtonsContainer.appendChild(cancelButton);

    const modalDivider = document.createElement('hr');

    modalBox.appendChild(modalTitle);
    modalBox.appendChild(messageContainer);
    modalBox.appendChild(formInputsContainer);
    modalBox.appendChild(modalDivider);
    modalBox.appendChild(modalButtonsContainer);
    modalContainer.appendChild(modalBox);
    modalOverlay.appendChild(modalContainer);

    document.body.appendChild(modalOverlay);
}

/**
 * The tabs available in the settings modal.
 */
enum SettingsTab {
    Account,
    Appearance,
    Reader,
    Language,
    Notifications

};

/**
 * The tabs available in the settings modal.
 */
const settingsTabs = [
    'Account', 'Appearance', 'Reader', 'Language', 'Notifications'
];

/**
 * Creates a settings modal.
 */
function createSettingsModal()
{
    const settingsModalOverlay = document.createElement('div'); 
    settingsModalOverlay.id = 'settings-modal';
    settingsModalOverlay.classList.add('overlay');

    const settingsContainer = document.createElement('div');
    settingsContainer.classList.add('settings-container');

    const settingsHeader = document.createElement('div');
    settingsHeader.classList.add('settings-header');

    const settingsTitle = document.createElement('h2');
    settingsTitle.textContent = 'SETTINGS';

    const settingsCloseButton = document.createElement('button');
    settingsCloseButton.classList.add('settings-close-button', 'filter-white');

    const closeButtonIcon = document.createElement('img');
    closeButtonIcon.src = '../resources/assets/icons/close.svg';

    settingsCloseButton.appendChild(closeButtonIcon);
    settingsHeader.appendChild(settingsTitle);
    settingsHeader.appendChild(settingsCloseButton);

    const settingsBody = document.createElement('div');
    settingsBody.classList.add('settings-body');

    const settingsTabList = document.createElement('div');
    settingsTabList.classList.add('settings-tabs');

    settingsTabs.forEach((tabName) =>
    {
        const settingsTab = document.createElement('button');
        settingsTab.classList.add('tab');
        settingsTab.textContent = tabName;
        settingsTabList.appendChild(settingsTab);
    });

    const settingsDivider = document.createElement('hr');

    const settingsContent = document.createElement('div');
    settingsContent.classList.add('settings-content');

    settingsBody.appendChild(settingsTabList);
    settingsBody.appendChild(settingsDivider);
    settingsBody.appendChild(settingsContent);

    settingsContainer.appendChild(settingsHeader);
    settingsContainer.appendChild(settingsBody);

    settingsModalOverlay.appendChild(settingsContainer);
    document.body.appendChild(settingsModalOverlay);
}

function settingsPutContent(content: SettingsTab)
{
    const contentDiv = document.querySelector('.settings-content') as HTMLElement;

    if (!contentDiv) {
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

    if (!content) {
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
    const settingsContent = document.querySelector('.settings-content') as HTMLElement;

    if (!settingsContent)
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

    languageSettings.forEach((settingName, index) =>
    {
        const languageContainer = document.createElement('div');
        languageContainer.classList.add('select-container');

        const settingLabel = document.createElement('label');
        settingLabel.textContent = settingName;

        const languageSelect = document.createElement('select');

        const availableLanguages = [ 
            '🇺🇸 English', '🇮🇹 Italiano', '🇫🇷 Française', '🇩🇪 Deutsch', '🇪🇸 Español', '🇷🇺 Pусский' 
        ];

        availableLanguages.forEach((languageName) =>
        {
            const languageOption = document.createElement('option');
            languageOption.value = languageName.toLowerCase();
            languageOption.textContent = languageName;

            languageSelect.appendChild(languageOption);
        });

        languageContainer.appendChild(settingLabel);
        languageContainer.appendChild(languageSelect);

        const descriptionContainer = document.createElement('div');
        descriptionContainer.classList.add('settings-item-description');

        const descriptionText = document.createElement('label');
        descriptionText.textContent = languageDescriptions[index];

        descriptionContainer.appendChild(descriptionText);

        settingsContent.appendChild(languageContainer);
        settingsContent.appendChild(descriptionContainer);
    }); 
}

function settingsPutAppearance()
{
    const settingsContent = document.querySelector('.settings-content') as HTMLElement;

    if (!settingsContent)
    {
        return;
    }

    const appearanceSettings = [ 
        'Application Theme' 
    ];

    const appearanceDescriptions = [ 
        'Choose the theme you would like to use for the application.' 
    ];

    const themeContainer = document.createElement('div');
    themeContainer.classList.add('select-container');

    const themeLabel = document.createElement('label');
    themeLabel.textContent = appearanceSettings[0];
    
    const themeSelect = document.createElement('select');

    const darkThemeOption = document.createElement('option');
    darkThemeOption.value = 'dark';
    darkThemeOption.textContent = '🌚 Dark Theme';

    const lightThemeOption = document.createElement('option');
    lightThemeOption.value = 'light';
    lightThemeOption.textContent = '🌝 Light Theme';

    themeSelect.appendChild(darkThemeOption);
    themeSelect.appendChild(lightThemeOption);

    themeContainer.appendChild(themeLabel);
    themeContainer.appendChild(themeSelect);

    const descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('settings-item-description');

    const descriptionText = document.createElement('label');
    descriptionText.textContent = appearanceDescriptions[0];

    descriptionContainer.appendChild(descriptionText);
    
    settingsContent.appendChild(themeContainer);
    settingsContent.appendChild(descriptionContainer);
}

function settingsPutAccount()
{
    const settingsContent = document.querySelector('.settings-content') as HTMLElement;

    if (!settingsContent)
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
    let isChangeEmail = false;
    let isChangePassword = false;

    accountSettings.forEach((settingName, index) =>
    {
        isDeleteAccount = settingName === 'Delete Account';
        isChangeEmail = settingName === 'Change Email';
        isChangePassword = settingName === 'Change Password';

        const settingContainer = document.createElement('div');
        settingContainer.classList.add('action-container');

        if (isDeleteAccount)
        {
            settingContainer.id = 'delete-account-container';
        }

        const settingLabel = document.createElement('label');
        settingLabel.textContent = settingName;

        const actionButton = document.createElement('button');
        actionButton.classList.add('settings-button');
        actionButton.textContent = settingName;

        if (isDeleteAccount)
        {
            settingLabel.id = 'delete-account-label';
            actionButton.id = 'delete-account-button';
        }

        if (isChangeEmail)
        {
            bindClickEvent(actionButton, () =>
            {
                createDynamicModal('Please provide your NEW email address:',
                [
                    {
                        type: 'email',
                        placeholder: 'New Email',
                        descriptorImageSrc: '../resources/assets/icons/mail.svg',
                        inputClasses: [ 'generic-input', 'email-input' ],
                        descriptorButtonClasses: [ 'descriptor' ]
                    },
                    {
                        type: 'email',
                        placeholder: 'Confirm New Email',
                        descriptorImageSrc: '../resources/assets/icons/mail.svg',
                        inputClasses: [ 'generic-input', 'email-input' ],
                        descriptorButtonClasses: [ 'descriptor' ]
                    }
                ],
                () =>
                {
                    createDynamicModal('Enter your password to confirm changing the email to: new@example.com',
                    [
                        {
                            type: 'password',
                            placeholder: 'Password',
                            descriptorImageSrc: '../resources/assets/icons/lock.svg',
                            inputClasses: [ 'generic-input', 'password-input' ],
                            descriptorButtonClasses: [ 'descriptor' ],
                            togglePasswordId: 'toggle-password-3',
                            togglePasswordText: 'Show',
                            togglePasswordClasses: [ 'toggle-password' ]
                        }
                    ],
                    () =>
                    {
                        createLoadingModal('Changing email ...', 
                        () =>
                        {
                            createWarningModal(ModalType.Success, 'The email has been changed successfully.');
                        });
                    },
                    () =>
                    {
                        createWarningModal(ModalType.Failed, 'The email change operation has been cancelled.',
                        () => {},
                        'OK', 'Cancelled'); 
                    });
                },
                () => {});
            });
        }

        if (isChangePassword)
        {
            bindClickEvent(actionButton, () =>
            {
                createDynamicModal('Please provide your NEW password:',
                [
                    {
                        type: 'password',
                        placeholder: 'New Password',
                        descriptorImageSrc: '../resources/assets/icons/lock.svg',
                        inputClasses: [ 'generic-input', 'password-input' ],
                        descriptorButtonClasses: [ 'descriptor' ],
                        togglePasswordId: 'toggle-password-3',
                        togglePasswordText: 'Show',
                        togglePasswordClasses: [ 'toggle-password' ]
                    },
                    {
                        type: 'password',
                        placeholder: 'Confirm New Password',
                        descriptorImageSrc: '../resources/assets/icons/lock.svg',
                        inputClasses: [ 'generic-input', 'password-input' ],
                        descriptorButtonClasses: [ 'descriptor' ],
                        togglePasswordId: 'toggle-password-4',
                        togglePasswordText: 'Show',
                        togglePasswordClasses: [ 'toggle-password' ]
                    }
                ],
                () =>
                {
                    createDynamicModal('Enter your CURRENT password to confirm the password change.',
                    [
                        {
                            type: 'password',
                            placeholder: 'Current Password',
                            descriptorImageSrc: '../resources/assets/icons/lock.svg',
                            inputClasses: [ 'generic-input', 'password-input' ],
                            descriptorButtonClasses: [ 'descriptor' ],
                            togglePasswordId: 'toggle-password-3',
                            togglePasswordText: 'Show',
                            togglePasswordClasses: [ 'toggle-password' ]
                        }
                    ],
                    () =>
                    {
                        createLoadingModal('Changing password ...', 
                        () =>
                        {
                            createWarningModal(ModalType.Success, 'The password has been changed successfully.');
                        });
                    },
                    () =>
                    {
                        createWarningModal(ModalType.Failed, 'The password change operation has been cancelled.',
                        () => {},
                        'OK', 'Cancelled'); 
                    });
                },
                () => {});
            });
        }

        if (isDeleteAccount)
        {
            bindClickEvent(actionButton, () =>
            {
                createDestructiveModal('Account deletion is a permanent action.<br>'
                                        + 'You will lose all your data and documents.<br><br>'
                                        + 'Are you sure you want to proceed?',
                () => // ok
                {
                    createDynamicModal('Please enter your password to confirm the deletion of your account.', 
                    [
                        {
                            type: 'password',
                            placeholder: 'Password',
                            descriptorImageSrc: '../resources/assets/icons/lock.svg',
                            inputClasses: [ 'generic-input', 'password-input' ],
                            descriptorButtonClasses: [ 'descriptor' ],
                            togglePasswordId: 'toggle-password-3',
                            togglePasswordText: 'Show',
                            togglePasswordClasses: [ 'toggle-password' ]
                        }
                    ],
                    () =>
                    {
                        createLoadingModal('Working on it ...', 
                        () =>
                        {
                            createWarningModal(ModalType.Success, 'Your account is planned for deletion on:<br> 09-14-2024.<br><br>'
                                                                    + 'You have 7 days to cancel the deletion process.<br><br>'
                                                                    + 'Please check your email for more details.',
                            () =>
                            {
                                navigateTo('register.html')
                            });
                        });
                    },
                    () =>
                    {
                        createWarningModal(ModalType.Failed, 'The account deletion operation has been cancelled.', 
                        () => {},
                        'OK', 'Cancelled'); 
                    });
                },
                () => {});
            });
        }

        settingContainer.appendChild(settingLabel);
        settingContainer.appendChild(actionButton);

        const descriptionContainer = document.createElement('div');
        descriptionContainer.classList.add('settings-item-description');

        const descriptionText = document.createElement('label');
        descriptionText.textContent = accountDescriptions[index];

        descriptionContainer.appendChild(descriptionText);

        settingsContent.appendChild(settingContainer);
        settingsContent.appendChild(descriptionContainer);
    });
}

function removeModal(modalId: string): boolean 
{
    const modal = document.getElementById(modalId);

    if (modal) {
        document.body.removeChild(modal);
    }

    return modal ? true : false;
}
