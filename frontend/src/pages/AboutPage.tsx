import React from 'react';
import NavBar from '../components/NavBar';
import styles from './AboutPage.module.css';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <NavBar />
      <div className={styles.aboutContainer}>
        <h1>About</h1>

        <div className={styles.section}>
          <img src="/person.png" alt="Mission Icon" className={styles.featureIcon} />
          <div className={styles.sectionText}>
            <h2>Our Mission</h2>
            <p>Children of immigrants are often the ones translating government documents for their families — even when they’re too young to understand them.</p>
            <p>RootsAI exists to change that.</p>
            <p>We help immigrant families apply for and understand how to reach government programs and resources without having to rely on their children to translate or interpret complex processes.</p>
          </div>
        </div>

        <div className={styles.section}>
          <img src="/lightbulb.png" alt="How We Started Icon" className={styles.featureIcon} />
          <div className={styles.sectionText}>
            <h2>How We Started</h2>
            <p>RootsAI was born out of a shared frustration.</p>
            <p>As second-generation Americans, we’ve all experienced how difficult it is for our parents to navigate government services — and how we, as kids, were expected to help.</p>
            <p>We wanted to build something that could truly help the families in our communities.</p>
          </div>
        </div>

        <div className={styles.section}>
          <img src="/team.png" alt="Our Team Icon" className={styles.featureIcon} />
          <div className={styles.sectionText}>
            <h2>Our Team</h2>
            <p> We are Ethan Ngo, Alexis Vega, Eric Ly, and Natasha Tran.</p>
            <p>We’re all computer science majors who came together at ACM UCSD’s DiamondHacks 2025 hackathon to build something meaningful to help solve a common problem. </p>
            <p>We are all second-generation Americans. Our parents are immigrants. And this is our way of giving back.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
