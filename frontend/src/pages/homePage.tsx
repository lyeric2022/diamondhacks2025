import React from 'react';
import NavBar from '../components/NavBar';
import LanguageMarquee from '../components/languageMarquee';
import styles from './homePage.module.css';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {
    const navigate = useNavigate()
  return (

    <div>
        <NavBar/>
        <LanguageMarquee/>
        <div className={styles.languagedisclaimer}>
            <p>Available in different languages</p>
        </div>

        <div className={styles.introContainer}>
            <div className={styles.LHSIntro}>
                <h1>Your Guide to Government Programs</h1>
                <h2>An AI assistant helping you apply for government benefits</h2>
                <button onClick={()=>{navigate("voice-chat")}}>Get Started</button>
            </div>

            <div className={styles.RHSIntro}>
                <img src="./aihelper.png" alt="AI Helper" className={styles.aiHelperImage} />
            </div>
        </div>
        <hr className={styles.hr} />
        <div className={styles.bottomContainer}>
            <div className={styles.LHSBottom}>
                <div className={styles.feature}>
                    <img src="/person.png" alt="Remembers" className={styles.featureIcon} />
                    <div className={styles.featureText}>
                        <h4>Remembers Your Situation</h4>
                        <p>RootsAI handles household details and uses multilingual voices for non-English speakers.</p>
                    </div>
                </div>
                <div className={styles.feature}>
                    <img src="/checklist.png" alt="Simplifies" className={styles.featureIcon} />
                        <div className={styles.featureText}>
                            <h4>Simplifies Applications</h4>
                            <p>Get easy guides for programs like EBT, CalFresh, housing, ESL, and more</p>
                        </div>
                </div>
            </div>

            <div className={styles.RHSBottom}>
                <h4>Government Programs</h4>
                <div className={styles.programGrid}>
                    <div className={styles.programItem}>Food Benefits (SNAP)</div>
                    <div className={styles.programItem}>Student Aid (FAFSA)</div>
                    <div className={styles.programItem}>Medicaid / Medicare</div>
                    <div className={styles.programItem}>Social Security</div>
                    <div className={styles.programItem}>Unemployment</div>
                    <div className={styles.programItem}>Section 8</div>
                    <div className={styles.programItem}>DACA</div>
                    <span className={styles.moreText}>and more!</span>
                </div>
            </div>
        </div> 
    </div>
  );
};

export default HomePage;

