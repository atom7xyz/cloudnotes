window.addEventListener('DOMContentLoaded', () =>
{
    bindClickEvent('toggle-password-1', () =>
    {
        togglePasswordVisibilityIndex(0);
    });

    bindClickEvent('toggle-password-2', () =>
    {
        togglePasswordVisibilityIndex(1);
    });

    setupValidation();
});

function togglePasswordVisibilityIndex(int : number): void 
{
    const passwordInputs = document.getElementsByClassName('password-input') as HTMLCollectionOf<HTMLInputElement>;
    const toggleButtons = document.querySelectorAll('.toggle-password') as NodeListOf<HTMLButtonElement>;

    if (passwordInputs && toggleButtons) 
    {
        if (passwordInputs[int].type === 'password') 
        {
            passwordInputs[int].type = 'text';
            toggleButtons[int].textContent = 'Hide ';
        }
        else 
        {
            passwordInputs[int].type = 'password';
            toggleButtons[int].textContent = 'Show';
        }
    }
}

function setupValidation()
{
    let emailValidator      = new InputValidator('email', 5, 80, 
                                                /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, 
                                                'Please fill out this field', 'Email must be between 5 and 80 characters', 'Invalid email format');

    let nameValidator       = new InputValidator('name', 2, 32,
                                                /^[a-zA-Z]+$/, 
                                                'Please fill out this field', 'Name must be between 2 and 32 characters', 'Name must contain only letters');

    let surnameValidator    = new InputValidator('surname', 2, 32,
                                                /^[a-zA-Z]+$/, 
                                                'Please fill out this field', 'Surname must be between 2 and 32 characters', 'Surname must contain only letters');

    let passwordValidator   = new InputValidator('password', 8, 32,
                                                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, 
                                                'Please fill out this field', 'Password must be between 8 and 32 characters', 
                                                'Password must contain at least one uppercase letter, one lowercase letter and one number');

    let recoveryCodeValidator = new InputValidator('recovery-code', 6, 6,
                                                /^[0-9]+$/, 
                                                'Please fill out this field', 'Recovery code must be 6 characters long', 'Recovery code must contain only numbers');

    const form = document.getElementById('form') as HTMLFormElement;
    const inputs = form.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;

    const email = document.getElementById('email') as HTMLInputElement;
    const name = document.getElementById('name') as HTMLInputElement | null;
    const surname = document.getElementById('surname') as HTMLInputElement | null;
    const password = document.getElementById('password') as HTMLInputElement;
    const passwordRepeat = document.getElementById('password-repeat') as HTMLInputElement | null;
    const recoveryCode = document.getElementById('recovery-code') as HTMLInputElement | null;

    function validatePasswordRepeat(): boolean | null 
    {
        if (passwordRepeat === null)
        {
            return null;
        }

        if (passwordRepeat.value !== password.value) 
        {
            passwordRepeat.setCustomValidity('Passwords do not match');
            passwordRepeat.reportValidity();
            applyErrorColor(passwordRepeat);
        } 
        else 
        {
            removeErrorColor(passwordRepeat);
        }

        return passwordRepeat.value !== password.value;
    }

    let timeout: NodeJS.Timeout | null;
    let currentTypingElement: HTMLInputElement | null;

    function internalValidation(): ValidationResult
    {
        let validationResult = new ValidationResult();

        switch (currentTypingElement)
        {
            case email:
                validationResult.add(emailValidator.validate(validationResult));
                break;
            case name:
                validationResult.add(nameValidator.validate(validationResult));
                break;
            case surname:
                validationResult.add(surnameValidator.validate(validationResult));
                break;
            case password:
                validationResult.add(passwordValidator.validate(validationResult));
                break;
            case passwordRepeat:
                let result = validatePasswordRepeat();
                if (result !== null)
                {
                    validationResult.add(result);
                }
                break;
            case recoveryCode:
                validationResult.add(recoveryCodeValidator.validate(validationResult));
                break;
        }

        return validationResult;
    }

    form.addEventListener('input', () =>
    {
        clearTimeout(timeout as NodeJS.Timeout);
        clearInputCustomValidity(' '); 

        timeout = setTimeout(() =>
        {
            internalValidation();
        }, 1000);
    });

    submitButton.addEventListener('click', () =>
    {
        clearInputCustomValidity('');
    });

    inputs.forEach((input) =>
    {
        input.addEventListener('focus', () =>
        {
            currentTypingElement = input;
        });

        input.addEventListener('keydown', (event) =>
        {
            if (event.key !== 'Enter')
            {
                return;
            }
            
            clearTimeout(timeout as NodeJS.Timeout);

            let index = Array.from(inputs).indexOf(input);
            let result = internalValidation();
            
            if (result.isDone())
            {
                event.preventDefault();
                return;
            }
            
            if (index === -1)
            {
                return;
            }

            if (index === inputs.length - 1)
            {
                if (input.type === 'checkbox')
                {
                    input.checked = true;
                }

                clearInputCustomValidity('');
                event.preventDefault();
                submitButton.focus();
                return;
            }

            event.preventDefault();
            inputs[index + 1].focus();
        });
    });
    
    form.addEventListener('submit', (event) =>
    {
        clearInputCustomValidity('');

        let validationResult = new ValidationResult();

        validationResult.add(emailValidator.validate(validationResult));
        validationResult.add(nameValidator.validate(validationResult));
        validationResult.add(surnameValidator.validate(validationResult));
        validationResult.add(passwordValidator.validate(validationResult));
        validationResult.add(recoveryCodeValidator.validate(validationResult));

        if (validationResult.isDone())
        {
            event.preventDefault();
            return;
        }

        let repeatResult = validatePasswordRepeat();
        
        if (repeatResult === null || !repeatResult)
        {
            throwEvent('validation-completed', { form });
            event.preventDefault();
        }
    });
}

function clearInputCustomValidity(value: string): void
{
    let inputs = document.getElementsByTagName('input');

    for (let element of inputs)
    {
        element.setCustomValidity(value);
    }
}

class ValidationResult
{
    protected results: boolean[];
    protected done: boolean;

    constructor()
    {
        this.results = [];
        this.done = false;
    }

    add(result: boolean): void
    {
        if (this.done)
        {
            return;
        }

        this.results.push(result);
        this.done = result;
    }

    get(): boolean[]
    {
        return this.results;
    }

    isDone(): boolean
    {
        return this.done;
    }
}

class InputValidator 
{
    protected input: string;
    protected minLength: number;
    protected maxLength: number;
    protected regex: RegExp | null;
    protected emptyMessage: string;
    protected lengthMessage: string;
    protected invalidMessage: string;

    constructor(input: string, minLength: number, 
                maxLength: number, regex: RegExp | null, 
                emptyMessage: string, lengthMessage: string, 
                invalidMessage: string) 
    {
        this.input = input;
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.regex = regex;
        this.emptyMessage = emptyMessage;
        this.lengthMessage = lengthMessage;
        this.invalidMessage = invalidMessage;
    }

    validate(validationResult: ValidationResult): boolean 
    {
        if (validationResult.isDone()) 
        {
            return false;
        }

        let element = document.getElementById(this.input) as HTMLInputElement | null;

        if (element === null) 
        {
            return false;
        }

        let value = element.value;
        let result: string = '';

        if (value.length <= 0) 
        {
            result = this.emptyMessage;
        } 
        else if (value.length < this.minLength || value.length > this.maxLength) 
        {
            result = this.lengthMessage;
        } 
        else if (this.regex !== null && !this.regex.test(value)) 
        {
            result = this.invalidMessage;
        }

        if (result !== '') 
        {
            element.setCustomValidity(result);
            element.reportValidity();

            applyErrorColor(element);
        }
        else
        {
            removeErrorColor(element);
        }

        return result !== '';
    }
}

function applyErrorColor(element: HTMLElement): void
{
    element.style.border = 'var(--dracula-red) 1px solid';

    const parentElement = element.parentElement;

    if (!parentElement) 
    {
        return; 
    }

    const images = parentElement.querySelectorAll<HTMLImageElement>('img');
    let index = element.id === 'surname' ? 1 : 0;

    if (images && images.length > 0)
    {
        let singleElement = images[index];

        singleElement.classList.remove('filter-gray');
        singleElement.classList.add('filter-red');
    }
}

function removeErrorColor(element: HTMLElement): void
{
    element.style.border = '';

    const parentElement = element.parentElement;
    
    if (!parentElement) 
    {
        return; 
    }

    const images = parentElement.querySelectorAll<HTMLImageElement>('img');
    let index = element.id === 'surname' ? 1 : 0;

    if (images && images.length > 0)
    {
        let singleElement = images[index];

        singleElement.classList.remove('filter-red');
        singleElement.classList.add('filter-gray');
    }
}
