import React from 'react';
import styles from './languageMarquee.module.css';

const LanguageMarquee: React.FC = () => {
  const languages = `
    English   Español   Tagalog   Tiếng Việt   中文   한국어   العربية   Русский   हिन्दी   Français   日本語   فارسی   اردو   ไทย   Deutsch   Italiano   Kiswahili   Ελληνικά   Türkçe   українська   বাংলা   עברית   नेपाली   ગુજરાતી
  `;

  return (
    <div className={styles.languageMarqueeWrapper}>
      <div className={styles.languageMarquee}>
        <span>{languages} &nbsp; {languages}</span>
      </div>
    </div>
  );
};

export default LanguageMarquee;
