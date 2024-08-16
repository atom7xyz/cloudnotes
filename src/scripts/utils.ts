function sendToBackend(message: string, ...data: any[]) 
{
    // @ts-ignore
    window.backend.send(message, data);
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
