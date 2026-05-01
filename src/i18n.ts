import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "welcome": "Welcome to Chunav Sathi",
          "chat_preview": "Your election companion"
        }
      },
      hi: {
        translation: {
          "welcome": "चुनाव साथी में आपका स्वागत है",
          "chat_preview": "आपका चुनाव साथी"
        }
      }
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
