function sendToBackend(message: string) 
{
    // @ts-ignore
    window.backend.send(message);
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
