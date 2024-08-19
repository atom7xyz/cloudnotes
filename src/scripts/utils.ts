class FormDataSave 
{
    protected data: Map<string, string>;

    constructor()
    {
        this.data = new Map();
    }

    public putInData(name: string, value: string)
    {
        this.data.set(name, value);
    }

    public getData(): Map<string, string>
    {
        return this.data;
    }

    public has(name: string): boolean
    {
        return this.data.has(name);
    }

    public static fromJSON(json: any): FormDataSave 
    {
        const formDataSave = new FormDataSave();

        Object.entries(json.data)
              .forEach(([key, value]) => formDataSave.putInData(key, value as string));

        return formDataSave;
    }

    public toJSON()
    {
        const serializedData: { [key: string]: string } = {};

        this.data.forEach((value, key) => serializedData[key] = value);

        return { data: serializedData };
    }
}

class FormDataSaveBank
{
    protected bank: Map<string, FormDataSave>;

    constructor()
    {
        this.bank = new Map();
    }
 
    public putInBank(url: string, save: FormDataSave)
    {
        this.bank.set(url, save);
    }

    public getBank(): Map<string, FormDataSave>
    {
        return this.bank;
    }

    public clearBank()
    {
        this.bank.clear();
    }

    public has(name: string): boolean
    {
        return this.bank.has(name);
    }

    public static fromJSON(json: any): FormDataSaveBank 
    {
        const formDataSaveBank = new FormDataSaveBank();

        Object.entries(json.bank)
              .forEach(([key, value]) => formDataSaveBank.putInBank(key, FormDataSave.fromJSON(value)));

        return formDataSaveBank;
    }

    public toJSON()
    {
        const serializedBank: { [key: string]: object } = {};

        this.bank.forEach((value, key) => serializedBank[key] = value.toJSON());

        return { bank: serializedBank };
    }
}

window.addEventListener('DOMContentLoaded', () =>
{
    bindEvent(window.document.body, 'submit', () =>
    {
        if (isFormPartiallyFilled())
        {
            sendToBackend('form-submitted', window.location.href);
        }
    });

    document.addEventListener('save-forms', () =>
    {
        if (isFormPartiallyFilled())
        {
            let dataBankJson = JSON.stringify(saveFormData());
            sessionStorage.setItem('form-data', dataBankJson);
        }
    });
});
   
window.addEventListener('DOMContentLoaded', async () =>
{
    const allowed = await restoreAllowed();

    if (!allowed)
    {
        return;
    }

    let item: string | null = sessionStorage.getItem('form-data');

    if (!item)
    {
        return;
    }

    let parsedBank: FormDataSaveBank = FormDataSaveBank.fromJSON(JSON.parse(item));

    let result = restoreFormData(parsedBank);

    if (result)
    {
        sessionStorage.removeItem('form-data');
    }
});

const pagesToRestore = new Map<string, string[]>();
pagesToRestore.set('register.html', ['terms-of-service.html']);

async function restoreAllowed()
{
    const history = await getHistory(); 

    if (!history)
    {
        return false;
    }

    // @ts-ignore
    const currentUrl = history.currentUrl;
    // @ts-ignore
    const nextUrl = history.nextUrl;

    if (!currentUrl || !nextUrl)
    {
        return false;
    }

    const partOfInterest = currentUrl.split('/').pop() as string;

    if (!pagesToRestore.has(partOfInterest))
    {
        return false;
    }

    let pages = pagesToRestore.get(partOfInterest) as string[];

    // @ts-ignore
    let temp = pages.some((page) => nextUrl.includes(page));

    return temp;
}

function saveFormData(): FormDataSaveBank 
{
    const inputs = document.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
    const href = window.location.href;

    let dataBank: FormDataSaveBank = new FormDataSaveBank();
    let dataSave: FormDataSave = new FormDataSave();

    inputs.forEach(input => dataSave.putInData(input.name, input.value));
    dataBank.putInBank(href, dataSave);

    return dataBank;
}

function restoreFormData(dataBank: FormDataSaveBank): boolean
{
    const href = window.location.href;

    if (!dataBank.has(href))
    {
        return false;
    }

    let dataSave: FormDataSave | undefined = dataBank.getBank().get(href);

    if (!dataSave)
    {
        return false;
    }

    const inputs = document.querySelectorAll("input") as NodeListOf<HTMLInputElement>;

    inputs.forEach(input =>
    {
        if (dataSave.has(input.name))
        {
            input.value = dataSave.getData().get(input.name) as string;
        }
    });

    return true;
}

function sendToBackend(message: string, ...data: any[]) 
{
    // @ts-ignore
    window.backend.send(message, data);
}

async function getHistory(): Promise<string[]>
{
    // @ts-ignore
    return await window.backend.getHistory();
}

function bindClickEvent(from: string | HTMLElement, callback: (args: any) => void)
{
    bindEvent(from, 'click', callback);
}

function bindEvent(from: string | HTMLElement, event: string, callback: (args: any) => void)
{
    if (typeof from === 'string')
    {
        const element = document.getElementById(from);

        if (element != null)
        {
            element.addEventListener(event, callback);
        }
    }

    if (from instanceof HTMLElement)
    {
        from.addEventListener(event, callback);
    }
}

function getRandomMessage(list: string[]): string
{
    return list[Math.floor(Math.random() * list.length)];
}

function throwEvent(eventName: string, detail: any) 
{
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function isThereAnyForm(): boolean
{
    return document.querySelectorAll('form').length > 0;
}

function isFormPartiallyFilled(): boolean
{
    const form = document.querySelector('form') as HTMLFormElement;

    if (!form) 
    {
        return false;
    }

    for (let i = 0; i < form.elements.length; i++) 
    {
        const element = form.elements[i] as HTMLInputElement;

        if (element.type === 'text' || element.type === 'textarea' || element.type === 'password' || element.type === 'email') 
        {
            if (element.value !== '') 
            {
                return true;
            }
        }

        if (element.type === 'checkbox' || element.type === 'radio') 
        {
            if (element.checked) 
            {
                return true;
            }
        }
    }

    return false;
}

function clearAllForms(): void
{
    const forms = document.querySelectorAll('form');
    forms.forEach((form: HTMLFormElement) => form.reset()); 
}
