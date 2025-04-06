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
				// const transcription = await openai.audio.transcriptions.create({
				// 	file: file,
				// 	model: "gpt-4o-transcribe",
				// 	response_format: "text",
				//   });
				// console.log(transcription)
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
			<p>Status: {status}</p>
			<button className="voice-button" onClick={handleRecording}>{isRecording ? "stop" : "start"}</button>
			<audio src={mediaBlobUrl || ""} controls />
		</div>
	)
}

export default VoiceButton