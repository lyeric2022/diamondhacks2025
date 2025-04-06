import { useNavigate } from "react-router-dom";
import VoiceButton from "../components/VoiceButton";
import "./VoiceChat.css";
import NavBar from '../components/navBar';

const VoiceChat = () => {
  const navigate = useNavigate();

  return (
	<div>
		<NavBar/>
		<div className="voice-chat-container">
      {/* Left Section: Voice Assistant */}
      <div className="voice-assistant">
        <h2 style={{fontSize: "50px"}}>Voice Chat</h2>
        <div className="assistant-avatar">
          <img
            src={'./aihelper.png'} //Replace with your avatar image URL
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
      </div>
    </div>
	</div>
    
  );
};

export default VoiceChat;