
window.addEventListener('DOMContentLoaded', () => {
    const minimize = document.getElementById('button-minimize');
    const resize = document.getElementById('button-fullscreen');
    const close = document.getElementById('button-close');

    if (minimize != null) minimize.onclick = () => {
        console.log("minimize");
        // @ts-ignore
        window.backend.send("minimize", "renderer")
    };
    if (resize != null) resize.onclick = () => {
        console.log("resize");
        // @ts-ignore
        window.backend.send("resize", "renderer")
    };
    if (close != null) close.onclick = () => {
        console.log("close");
        // @ts-ignore
        window.backend.send("close", "renderer")
    };
})