import React from 'react';
import styles from './Nav.module.css';
import * as data from './links.json';
import LanguageDropdown from './languageDropdown';
const linksString = JSON.stringify(data);
const links = JSON.parse(linksString).links;


type Link = {
    label: string;
    href: string;
};

const Links: React.FC<{}> = () => {
    return (
        <div className={styles['links']}>
            {links.map((link: Link) => {
                return(
                    <div key={link.href} className={styles['link']}>
                        <a href={link.href}>
                            {link.label}
                        </a>
                    </div>
                )
            })}
        </div>
    );
}

const NavBar: React.FC<{}>= () => {
  return (
    
    <nav className={styles.navbar}>

        <div className={styles['LHSdiv']}>
            <img src="/rootsailogo.png" alt="Logo" style={{ width: '250px', height: 'auto' , marginTop: '12px'}} />

        </div>

        <div className={styles['RHSdiv']}>
            {/* Language Selector Button */}
            <div className={styles.languageSelector}>
                <LanguageDropdown />
            </div>
            {links.map((link: Link) => {
                return(
                    <div key={link.href} className={styles['link']}>
                        <a href={link.href}>
                            {link.label}
                        </a>
                    </div>
                )
            })}
        </div>

    </nav>
  );
};

export default NavBar;