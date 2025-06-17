import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

// Language detection function using Electron API
const detectSystemLanguage = async (): Promise<string> => {
  try {
    if (window.electron?.getSystemLanguage) {
      const systemLang = await window.electron.getSystemLanguage();
      console.log('Detected system language:', systemLang);
      return systemLang;
    }
  } catch (error) {
    console.error('Error detecting system language:', error);
  }
  
  // Fallback to English if detection fails
  return 'en';
};

// Initialize i18n with system language detection
const initializeI18n = async () => {
  const systemLanguage = await detectSystemLanguage();
  
  await i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      lng: systemLanguage, // Use detected system language
      fallbackLng: 'en',
      debug: false, // Set to false for production
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: 'locales/{{lng}}/{{ns}}.json',
      },
      ns: ['translation'],
      defaultNS: 'translation',
    });
};

// Initialize i18n
initializeI18n().catch(error => {
  console.error('Failed to initialize i18n:', error);
});

export default i18n;