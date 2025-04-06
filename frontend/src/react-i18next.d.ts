import 'react-i18next';
import translation from './locales/en.json';

declare module 'react-i18next' {
  interface Resources {
    translation: typeof translation;
  }
}
