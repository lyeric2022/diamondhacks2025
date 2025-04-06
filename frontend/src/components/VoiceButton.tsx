import { ReactMediaRecorder, useReactMediaRecorder } from "react-media-recorder";
import { useState } from "react";
import OpenAI from 'openai'
import fs from 'fs'
import "./VoiceButton.css"

const VoiceButton = () => {
	const [isRecording, setIsRecording] = useState(false)
	const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });

	const handleRecording = async () => {
		// const openai = new OpenAI;
		if(isRecording){
			if(mediaBlobUrl){
				const response = await fetch(mediaBlobUrl)
				const blob = await response.blob()
				const file = new File([blob], "audio.webm", { type: blob.type })
			}
			stopRecording()
			setIsRecording(false)
		}
		else{
			startRecording()
			setIsRecording(true)
		}
	}
	return(
		<div>
			<button className="voice-button" onClick={handleRecording}>{isRecording ? "stop" : "start"}</button>
		</div>
	)
}

export default VoiceButton