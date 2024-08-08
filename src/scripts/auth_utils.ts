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
    const passwordInputs = document.getElementsByName('password') as NodeListOf<HTMLInputElement>;
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
    let emailValidator      = new InputValidator('email', 5, 50, 
                                                null, 
                                                'Email is required', 'Email must be between 5 and 50 characters', 'Invalid email format');

    let nameValidator       = new InputValidator('name', 2, 32,
                                                /^[a-zA-Z]+$/, 
                                                'Name is required', 'Name must be between 2 and 32 characters', 'Name must contain only letters');

    let surnameValidator    = new InputValidator('surname', 2, 32,
                                                /^[a-zA-Z]+$/, 
                                                'Surname is required', 'Surname must be between 2 and 32 characters', 'Name must contain only letters');

    let passwordValidator   = new InputValidator('password', 8, 32,
                                                /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, 
                                                'Password is required', 'Password must be between 8 and 32 characters', 
                                                'Password must contain at least: one uppercase letter, one lowercase letter and one number');
     
    const form = document.getElementById('form') as HTMLFormElement;

    form.addEventListener('input', () =>
    {
        clearInputCustomValidity();
    });

    form.addEventListener('submit', (event) =>
    {
        let validationResult = new ValidationResult();

        validationResult.add(emailValidator.validate(validationResult));
        validationResult.add(nameValidator.validate(validationResult));
        validationResult.add(surnameValidator.validate(validationResult));
        validationResult.add(passwordValidator.validate(validationResult));

        if (validationResult.isDone())
        {
            event.preventDefault();
            return false;
        }
                
        let passwordElement = document.getElementById('password') as HTMLInputElement;
        let repeatPasswordElement = document.getElementById('password-repeat') as HTMLInputElement;

        if (repeatPasswordElement.value !== passwordElement.value) 
        {
            repeatPasswordElement.setCustomValidity('Passwords do not match');
            repeatPasswordElement.reportValidity();
            event.preventDefault();
        } 
    });
}

function clearInputCustomValidity(): void
{
    let inputs = document.getElementsByTagName('input');

    for (let element of inputs)
    {
        element.setCustomValidity('');
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
        } 

        return result !== '';
    }
}

