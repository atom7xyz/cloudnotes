function togglePasswordVisibilityIndex(int : number): void 
{
    const passwordInputs = document.getElementsByName('password') as NodeListOf<HTMLInputElement>;
    const toggleButtons = document.querySelectorAll('.toggle-password') as NodeListOf<HTMLButtonElement>;

    if (passwordInputs && toggleButtons) 
    {
        if (passwordInputs[int].type === 'password') 
        {
            passwordInputs[int].type = 'text';
            toggleButtons[int].textContent = 'Hide ';
        }
        else 
        {
            passwordInputs[int].type = 'password';
            toggleButtons[int].textContent = 'Show';
        }
    }
}

window.addEventListener('DOMContentLoaded', () =>
{
    bindClickEvent('toggle-password-1', () => {
        togglePasswordVisibilityIndex(0);
    });

    bindClickEvent('toggle-password-2', () => {
        togglePasswordVisibilityIndex(1);
    });
});
