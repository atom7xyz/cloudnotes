window.addEventListener('DOMContentLoaded', () => 
{
    setupCaptcha();

    const button = document.getElementById('send-pw-reset') as HTMLButtonElement;

    if (button) {
        button.disabled = true;
    }
});

let recaptchaCompleted = false;

function setupCaptcha()
{
    const button = document.getElementById('send-pw-reset') as HTMLButtonElement;
    const recaptchaCheckbox = document.getElementById('recaptchaCheckbox') as HTMLDivElement;
    const recaptchaSpinner = document.getElementById('recaptchaSpinner') as HTMLDivElement;
    const recaptchaCheckmark = document.getElementById('recaptchaCheckmark') as HTMLDivElement;

    bindClickEvent('recaptchaCheckbox', () =>
    {
        if (recaptchaCompleted) {
            return;
        }

        recaptchaCompleted = true;
        recaptchaSpinner.style.display = 'block';

        setTimeout(() => {
            button.disabled = false;
            recaptchaSpinner.style.display = 'none';
            recaptchaCheckmark.style.opacity = '1';
            recaptchaCheckbox.style.borderColor = '#34a853';        
        }, 2000);
    });
}
