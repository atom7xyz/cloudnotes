document.addEventListener('DOMContentLoaded', () => 
{
    bindClickEvent('button-settings', () =>
    {
        throwEvent('open-settings');
        handleSettingsChangeTab();
        throwEvent('change-tab', SettingsTab.Notifications);

        bindClickEvent('settings-close-button', () =>
        {
            throwEvent('close-settings');
        });
    });
});

function handleSettingsChangeTab()
{
    const tabs = document.querySelectorAll('.tab') as NodeListOf<HTMLElement>;

    if (!tabs)
    {
        return;
    }

    let counter = 0;

    tabs.forEach(tab => 
    {
        const index = counter++;

        bindClickEvent(tab, () =>
        {
            throwEvent('change-tab', index);
        });
    });
}

function settingsColorTab(index: number)
{
    const tabs = document.querySelectorAll('.tab') as NodeListOf<HTMLElement>;

    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[index].classList.add('active');
}
