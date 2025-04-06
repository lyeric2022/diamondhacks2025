import { ReactMediaRecorder } from "react-media-recorder";
import { useState } from "react";
import VoiceButton from "../components/VoiceButton";
const VoiceChat = () => {
	const [audio, setAudio] = useState(null)

	const handleRecording = () => {

	}

	return(
	<div>
		<VoiceButton/>
	</div>);
}

export default VoiceChat