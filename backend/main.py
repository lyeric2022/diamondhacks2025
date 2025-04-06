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
from transformers import VitsModel, AutoTokenizer
import torch
import scipy.io.wavfile
import base64
import io

LETTA_AGENT_ID = "agent-ae19d2d6-72fe-4dcf-b756-fc5005ed7043"
LETTA_TOKEN = "OTEyZDc0OWUtMzVkZi00NmI2LThlOGItNzQ3YzQ0NGQ5NWYzOjBhMjNlMjhiLTQyMWUtNDZkMy1hODM2LTEyNzA3ZWI4OWFhMQ=="


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

# Cache models for better performance
tts_models = {}
tts_tokenizers = {}

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
            timeout=180  # Changed from 30 to 180 seconds (3 minutes)
        )
        
        # Return the response from Letta
        return JSONResponse(
            status_code=response.status_code,
            content=response.json(),
        )
    except Exception as e:
        import traceback
        print(f"Exception in /proxy/letta: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tts")
async def text_to_speech(request: Request):
    """
    Converts text to speech using Hugging Face's MMS-TTS models
    """
    try:
        data = await request.json()
        text = data.get("text", "")
        lang = data.get("lang", "en")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Map language codes to MMS-TTS model IDs
        lang_to_model = {
            "en": "facebook/mms-tts-eng",
            "es": "facebook/mms-tts-spa",
            "vi": "facebook/mms-tts-vie",
            # Add more languages as needed
        }
        
        model_id = lang_to_model.get(lang, "facebook/mms-tts-eng")  # Default to English
        
        # Load model and tokenizer (with caching)
        if model_id not in tts_models:
            print(f"Loading TTS model for {lang}: {model_id}")
            tts_models[model_id] = VitsModel.from_pretrained(model_id)
            tts_tokenizers[model_id] = AutoTokenizer.from_pretrained(model_id)
        
        model = tts_models[model_id]
        tokenizer = tts_tokenizers[model_id]
        
        # Generate speech
        inputs = tokenizer(text, return_tensors="pt")
        with torch.no_grad():
            output = model(**inputs).waveform.numpy()[0]  # Get the first item and convert to numpy
        
        # Convert float values to int16 format for WAV
        # First normalize to [-1, 1], then scale to int16 range
        if output.max() > 1.0 or output.min() < -1.0:
            output = output / max(abs(output.max()), abs(output.min()))
        
        # Scale to int16 range and convert
        output_int16 = (output * 32767).astype(np.int16)
        
        # Convert to WAV format
        sampling_rate = model.config.sampling_rate
        wav_buffer = io.BytesIO()
        scipy.io.wavfile.write(wav_buffer, rate=sampling_rate, data=output_int16)
        wav_buffer.seek(0)
        
        # Convert to base64 for sending to frontend
        wav_base64 = base64.b64encode(wav_buffer.read()).decode('utf-8')
        
        return {
            "audio": wav_base64,
            "sampling_rate": sampling_rate,
            "language": lang
        }
        
    except Exception as e:
        import traceback
        print(f"TTS Error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))