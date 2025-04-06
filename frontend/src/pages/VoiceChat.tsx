import { useNavigate } from "react-router-dom";
import VoiceButton from "../components/VoiceButton";
import "./VoiceChat.css";
import aiHelperImage from "../assets/aihelper.png"

const VoiceChat = () => {
  const navigate = useNavigate();

  return (
    <div className="voice-chat-container">
      {/* Left Section: Voice Assistant */}
      <div className="voice-assistant">
        <h2 style={{fontSize: "50px"}}>Voice Chat</h2>
        <div className="assistant-avatar">
          <img
            src={aiHelperImage} //Replace with your avatar image URL
            alt="Assistant Avatar"
          />
        </div>
        <div className="assistant-message">
          <p>Hello! How can I assist you today?</p>
        </div>
        <VoiceButton />
      </div>

      {/* Right Section: Simplified Resources */}
      <div className="resources">
        <h2>CalFresh</h2>
        <h3>Simplified Resources</h3>
        <p>
          <strong>Program Summary</strong>
        </p>
        <p>
          This program provides financial assistance for purchasing food if you
          meet income requirements.
        </p>
        <h4>Steps for applying</h4>
        <ul>
          <li>Check your eligibility</li>
          <li>Complete an application online or in person</li>
          <li>Submit the required documents</li>
          <li>Attend an interview</li>
        </ul>
        <h4>What you need</h4>
        <ul>
          <li>Proof of Identity</li>
          <li>Proof of Income</li>
          <li>Proof of Residence</li>
        </ul>
        <h4>Resources</h4>
        <p>Visit the official website for more details.</p>
        <button onClick={() => navigate("/")}>Go to Landing</button>
      </div>
    </div>
  );
};

export default VoiceChat;