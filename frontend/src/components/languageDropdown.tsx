import React, { useState } from 'react';
import styles from './languageDropdown.module.css';

const languages = [
  { label: "English", code: "en", flag: "/americanflag.jpg" },
  { label: "Español", code: "es", flag: "/spanishflag.png" },
  { label: "中文", code: "zh", flag: "/chineseflag.png" },
  { label: "عربى", code: "ar", flag: "/arabicflag.png" }
];

const LanguageDropdown: React.FC = () => {
  const [selected, setSelected] = useState(languages[0]);
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(prev => !prev);
  const handleSelect = (lang: typeof selected) => {
    setSelected(lang);
    setOpen(false);
    console.log("Selected language:", lang.label);
    // Store in localStorage or context if needed
  };

  return (
    <div className={styles.dropdown}>
      <button className={styles.langButton} onClick={toggleDropdown}>
        <img src={selected.flag} alt={selected.label} className={styles.flagIcon} />
        <span>{selected.label}</span>
        <span className={styles.caret}>▼</span>
      </button>
      {open && (
        <ul className={styles.dropdownMenu}>
          {languages.map((lang) => (
            <li key={lang.code} onClick={() => handleSelect(lang)}>
              <img src={lang.flag} alt={lang.label} className={styles.flagIcon} />
              {lang.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageDropdown;
