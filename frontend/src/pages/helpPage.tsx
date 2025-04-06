import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import styles from './helpPage.module.css';
import { useNavigate } from 'react-router-dom';

const faqs = [
  {
    question: 'How do I get started?',
    answer: 'You can get started by going to the home page and clicking the "Get Started" button. From there click the start button to start speaking to our AI that will guide you through any questions you have.'
  },
  {
    question: 'Which languages are supported?',
    answer: 'We currently support English, Spanish, Mandarin, Arabic, and more!'
  },
  {
    question: 'How do I create an account?',
    answer: 'Click on "Sign In" in the navigation bar and select "Create an Account" to begin the sign-up process.'
  }
];

const HelpPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className={styles.container}>
      <NavBar />
      <div className={styles.topContainer}>
        <div className={styles.LHStop}>
          <h1>Help</h1>
          <p>
            Have Questions? Here you'll find the answers most valued by our users, along with access to step-by-step instructions and support.
          </p>
        </div>
        <div className={styles.RHStop}>
          <div className={styles.imageWrapper}>
            <img src="./helpperson.png" alt="AI Helper" className={styles.aiHelperImage} />
          </div>
        </div>
      </div>

      <div className={styles.bottomContainer}>
        <div className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>

          <ul className={styles.questionList}>
            {faqs.map((faq, index) => (
              <li key={index} onClick={() => toggleFAQ(index)}>
                <div className={styles.questionHeader}>
                  <span>{faq.question}</span>
                  <span className={styles.arrow}>{openIndex === index ? '▾' : '▸'}</span>
                </div>
                {openIndex === index && (
                  <p className={styles.answer}>{faq.answer}</p>
                )}
              </li>
            ))}
          </ul>

          <div className={styles.supportSection}>
            <strong>Need More Help?</strong>
            <p>Contact our support team for further assistance.</p>
            <a href="mailto:alexisvvegab@gmail.com" className={styles.contactButton}>
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
