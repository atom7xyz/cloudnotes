document.addEventListener('DOMContentLoaded', () => {
    const ref = Array.from(document.getElementsByClassName('file-reference'));
    ref.forEach((value: Element) => {
        if (value instanceof HTMLAnchorElement) {
            value.addEventListener('click', (event: Event) => {
                event.preventDefault();
                let target = value.getAttribute('href');
                if (target == null) return;
                let channel: string = "create-window";
                // @ts-ignore
                window.backend.send(channel, target);
            });
        }
    });
});