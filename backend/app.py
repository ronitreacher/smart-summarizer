from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import split_on_silence # Not strictly used in this version but useful for large audio
from models.nlp_processor import NLPProcessor # Our custom NLP class
from config import Config # For API keys if using external STT like AssemblyAI

app = Flask(__name__)
CORS(app) # Enable CORS for frontend interaction
app.config.from_object(Config)

# Initialize NLP Processor
nlp_processor = NLPProcessor()

# Ensure an uploads directory exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def transcribe_audio_local(audio_path):
    """
    Transcribes an audio file using Google Web Speech API (local processing, good for MVP).
    For longer audio, consider breaking it into chunks or using a dedicated service.
    """
    r = sr.Recognizer()
    try:
        with sr.AudioFile(audio_path) as source:
            audio_text = r.record(source) # read the entire audio file
            text = r.recognize_google(audio_text) # recognize_google is a free web API
            return text
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError as e:
        return f"Could not request results from Google Speech Recognition service; {e}"
    except Exception as e:
        return f"Error during transcription: {e}"

@app.route('/upload-audio', methods=['POST'])
def upload_audio():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    if audio_file.filename == '':
        return jsonify({'error': 'No selected audio file'}), 400

    if audio_file:
        filepath = os.path.join(UPLOAD_FOLDER, audio_file.filename)
        audio_file.save(filepath)

        # Transcribe
        transcribed_text = transcribe_audio_local(filepath)

        if transcribed_text.startswith("Error") or transcribed_text.startswith("Could not"):
            # Clean up even if there's a transcription error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': transcribed_text}), 500

        # Summarize
        summary = nlp_processor.summarize_text(transcribed_text)

        # Extract Action Items
        action_items = nlp_processor.extract_action_items(transcribed_text)

        # Clean up the uploaded file
        if os.path.exists(filepath):
            os.remove(filepath)

        return jsonify({
            'transcription': transcribed_text,
            'summary': summary,
            'action_items': action_items
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)