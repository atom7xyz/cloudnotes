window.addEventListener('DOMContentLoaded', () =>
{
   bindClickEvents(); 
});

function bindClickEvents() 
{
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => 
    {
        link.addEventListener('click', (event) => 
        {
            event.preventDefault();

            const targetAttribute = link.getAttribute('href');

            if (!targetAttribute) 
            {
                return;
            }

            const targetId = targetAttribute.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) 
            {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                highlightBlock(targetElement);
            }
        });
    });
}

function highlightBlock(block: HTMLElement)
{
    block.innerHTML = `<span class="tos-highlighted">${block.innerHTML}</span>`;

    setTimeout(() =>
    {
        block.innerHTML = block.innerHTML.replace('<span class="tos-highlighted">', '')
                                         .replace('</span>', '');
    }, 2000);
}
