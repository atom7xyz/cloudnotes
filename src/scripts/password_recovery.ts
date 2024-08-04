window.addEventListener('DOMContentLoaded', () => 
{
    spin();
});

function spin()
{
    const recaptchaCheckbox = document.getElementById('recaptchaCheckbox') as HTMLDivElement;
    const recaptchaSpinner = document.getElementById('recaptchaSpinner') as HTMLDivElement;
    const recaptchaCheckmark = document.getElementById('recaptchaCheckmark') as HTMLDivElement;

    let recaptchaCompleted = false;

    recaptchaCheckbox.addEventListener('click', () =>
    {
        if (recaptchaCompleted)
        {
            return; 
        }

        recaptchaCompleted = true;
        recaptchaSpinner.style.display = 'block';

        setTimeout(() => {
          recaptchaSpinner.style.display = 'none';
          recaptchaCheckmark.style.opacity = '1';
          recaptchaCheckbox.style.borderColor = '#34a853';        
        }, 2000);
    });
}
