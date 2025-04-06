import React, { CSSProperties } from 'react';
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
        <hr></hr>
        <div className='bottom-container'>
            <div className='LHS-bottom'>
                <div>
                    <h4>Remembers Your Situation</h4>
                </div>
                <div>
                    <h4>Simplifies Applications</h4>
                </div>
            </div>
            <div className='RHS-bottom'>
                <h4>Government Programs</h4>
            </div>

        </div>

        
    </div>
  );
};

export default HomePage;

