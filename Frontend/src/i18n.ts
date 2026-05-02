import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        appName: 'Chunav Sathi',
        faq: 'FAQ',
        searchPrompt: 'Ask anything to your Chunav Sathi',
        homeDescription: "Your trusted guide to India's elections, in your language and your way.",
        firstTimeVoter: 'First Time Voter',
        interactiveJourney: 'Interactive Journey',
        electionProcess: 'Election Process',
        learnBasics: 'Learn basics',
        askAnything: 'Ask Anything',
        aiVoiceCall: 'AI + voice call',
        chatPlaceholder: 'Message Chunav Sathi...',
        botTyping: 'Chunav Sathi is typing...',
        settings: 'Settings',
        chooseLanguage: 'Choose your language',
        theme: 'Theme',
        done: 'Done',
        dark: 'Dark',
        light: 'Light',
        system: 'System',
        recentUpdates: 'Recent updates',
        statusHelpTitle: 'What is Status here?',
        statusHelpText: 'Each feature has FAQ story cards. Tap any ring to see answers visually.',
        chatWelcome:
          'Namaste! I am your Chunav Sathi. Ask me anything about elections by text or voice.',
        chatUnavailable:
          'The chatbot is unavailable right now. Please make sure the backend is running and configured.',
      },
    },
    hi: {
      translation: {
        appName: 'चुनाव साथी',
        faq: 'सवाल-जवाब',
        searchPrompt: 'अपने चुनाव साथी से कुछ भी पूछें',
        homeDescription: 'भारत के चुनावों के लिए आपका भरोसेमंद मार्गदर्शक, आपकी भाषा में और आपके तरीके से।',
        firstTimeVoter: 'पहली बार वोटर',
        interactiveJourney: 'इंटरएक्टिव यात्रा',
        electionProcess: 'चुनाव प्रक्रिया',
        learnBasics: 'बुनियादी बातें सीखें',
        askAnything: 'कुछ भी पूछें',
        aiVoiceCall: 'एआई + वॉइस कॉल',
        chatPlaceholder: 'चुनाव साथी को संदेश लिखें...',
        botTyping: 'चुनाव साथी टाइप कर रहा है...',
        settings: 'सेटिंग्स',
        chooseLanguage: 'अपनी भाषा चुनें',
        theme: 'थीम',
        done: 'पूरा',
        dark: 'डार्क',
        light: 'लाइट',
        system: 'सिस्टम',
        recentUpdates: 'हाल के अपडेट',
        statusHelpTitle: 'यहाँ स्टेटस क्या है?',
        statusHelpText: 'हर फीचर में FAQ स्टोरी कार्ड हैं। जवाब देखने के लिए किसी भी रिंग पर टैप करें।',
        chatWelcome:
          'नमस्ते! मैं आपका चुनाव साथी हूँ। चुनावों के बारे में मुझसे टेक्स्ट या वॉइस में कुछ भी पूछिए।',
        chatUnavailable:
          'चैटबॉट अभी उपलब्ध नहीं है। कृपया सुनिश्चित करें कि बैकएंड चल रहा है और सही तरह से कॉन्फ़िगर है।',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
