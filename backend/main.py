import io
import base64
import tempfile
import os

import numpy as np
import librosa
import matplotlib.pyplot as plt
import whisper
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests

LETTA_AGENT_ID = "agent-ae19d2d6-72fe-4dcf-b756-fc5005ed7043";
LETTA_TOKEN = "OTEyZDc0OWUtMzVkZi00NmI2LThlOGItNzQ3YzQ0NGQ5NWYzOjBhMjNlMjhiLTQyMWUtNDZkMy1hODM2LTEyNzA3ZWI4OWFhMQ==";


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the Whisper model (you can choose another model size if desired)
model = whisper.load_model("base")

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Accepts an audio file upload, transcribes the audio using the Whisper model,
    computes a waveform visualization (RMS values), and returns both the transcription
    and a Base64-encoded PNG of the waveform.
    """
    try:
        # Read the uploaded file into memory
        contents = await file.read()
        
        # Save uploaded audio to a temporary file so ffmpeg can process it
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
            tmp.write(contents)
            tmp.flush()
            tmp_filename = tmp.name
        
        try:
            # Load and preprocess audio using Whisper's helper function for transcription
            # This handles various audio formats more robustly
            audio = whisper.load_audio(tmp_filename)
            audio = whisper.pad_or_trim(audio)
            
            # Load the same audio with librosa for visualization
            audio_for_viz, sr = librosa.load(tmp_filename, sr=16000)
            
            # Compute RMS (root mean square) values to approximate volume envelope
            frame_length = 1024
            hop_length = 512
            rms = librosa.feature.rms(y=audio_for_viz, frame_length=frame_length, hop_length=hop_length)[0]
            rms_list = rms.tolist()  # This list can be used for a visual chart on the front end

            # Generate a waveform plot using matplotlib
            times = np.linspace(0, len(audio_for_viz) / sr, num=len(rms))
            plt.figure(figsize=(10, 4))
            plt.plot(times, rms, color="blue")
            plt.xlabel("Time (s)")
            plt.ylabel("RMS Amplitude")
            plt.title("Audio Waveform")
            plt.tight_layout()
            buf = io.BytesIO()
            plt.savefig(buf, format="png")
            buf.seek(0)
            waveform_image = base64.b64encode(buf.read()).decode("utf-8")
            plt.close()

            # Transcribe the audio using Whisper with the temporary file path
            # This is more reliable for various audio formats
            result = model.transcribe(tmp_filename)
            transcription = result.get("text", "")

            return {
                "transcription": transcription,
                "waveform": rms_list,
                "waveform_image": waveform_image,
            }
        finally:
            # Clean up the temporary file
            if os.path.exists(tmp_filename):
                os.unlink(tmp_filename)
                
    except Exception as e:
        import traceback
        print(f"Exception in /transcribe: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/proxy/letta")
async def proxy_letta_request(request: Request):
    """
    Proxy requests to Letta API to avoid CORS issues
    """
    try:
        # Get the request body as JSON
        body = await request.json()
        
        # Forward the request to Letta API
        response = requests.post(
            f"https://api.letta.com/v1/agents/{LETTA_AGENT_ID}/messages",
            headers={
                "Authorization": f"Bearer {LETTA_TOKEN}",
                "Content-Type": "application/json"
            },
            json=body,
            timeout=30
        )
        
        # Return the response from Letta
        return JSONResponse(
            content=response.json(),
            status_code=response.status_code
        )
    except Exception as e:
        import traceback
        print(f"Exception in /proxy/letta: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
