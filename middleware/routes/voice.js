import fs from 'fs'
import OpenAI from 'openai'
import express from 'express'
import 'dotenv/config'

const router = express.Router()
const openai = new OpenAI();

router.post('/listen', async (req, res) => {
	try{
		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream(req.body.file),
			model: "gpt-4o-transcribe",
			response_format: "text",
		  });
		res.send(transcription).status(200)
	} catch(error) {
		console.log(error)
		res.send('Unable to transcribe').status(500)
	}
})

router.post('/speak', async(req, res) => {
	try{

		const speechFile = path.resolve("./speech.mp3");

		const mp3 = await openai.audio.speech.create({
		model: "gpt-4o-mini-tts",
		voice: "coral",
		input: req.body.text,
		instructions: "Speak in a cheerful and positive tone.",
		});

		const buffer = Buffer.from(await mp3.arrayBuffer());
		await fs.promises.writeFile(speechFile, buffer);
		res.send(speechFile).status(200)

	} catch(error) {
		res.send('Unable to convert to speech').status(500)
	}
})

export default voice;