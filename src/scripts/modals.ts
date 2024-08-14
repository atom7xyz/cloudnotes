window.addEventListener('DOMContentLoaded', () =>
{
    document.addEventListener('validation-completed', (event) =>
    {
        createLoadingModal(); 

        setTimeout(() =>
        {
            // @ts-ignore
            const form = event.detail.form as HTMLFormElement;
            form.submit();
        }, 3000);
    });
});

const randomMessage = [ 'Getting ready ...', 'Loading ...', 'Please wait ...', 'Almost there ...', 'Just a moment ...'];

function createLoadingModal() 
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
    p.textContent = getRandomMessage();

    box.appendChild(spinner);
    box.appendChild(p);
    boxContainer.appendChild(box);
    modal.appendChild(boxContainer);

    document.body.appendChild(modal);
}

function removeLoadingModal() 
{
    const modal = document.getElementById('spinner-container');

    if (modal) 
    {
        document.body.removeChild(modal);
    }
}

function getRandomMessage() 
{
    return randomMessage[Math.floor(Math.random() * randomMessage.length)];
}
