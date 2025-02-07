window.addEventListener('DOMContentLoaded', () =>
{
    bindLinksToHighlight(); 
});

function bindLinksToHighlight() 
{
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => 
    {
        bindClickEvent(link as HTMLElement, (event) => 
        {
            event.preventDefault();

            const targetAttribute = link.getAttribute('href');

            if (!targetAttribute) {
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

let latestHighlightedList: HTMLElement[] = [];

function highlightBlock(block: HTMLElement): void 
{
    if (latestHighlightedList.includes(block))
    {
        return;
    }

    latestHighlightedList.push(block);

    const span = document.createElement('span');
    span.classList.add('tos-highlighted');
    span.innerHTML = block.innerHTML;

    block.innerHTML = '';
    block.appendChild(span);

    setTimeout(() => {
        block.innerHTML = span.innerHTML;
        latestHighlightedList.splice(latestHighlightedList.indexOf(block), 1);
    }, 2000);
}
