# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import librosa
import numpy as np
import os
import traceback
from pydub import AudioSegment

# --- START OF THE FIX ---
# Use a raw string (r"...") to prevent unicode escape errors on Windows
ffmpeg_path = r"C:\Users\ASHISH\Downloads\ffmpeg-8.0-full_build(1)\ffmpeg-8.0-full_build\bin"
os.environ["PATH"] += os.pathsep + ffmpeg_path
AudioSegment.converter = os.path.join(ffmpeg_path, "ffmpeg.exe")
AudioSegment.ffprobe = os.path.join(ffmpeg_path, "ffprobe.exe")
# --- END OF THE FIX ---


app = Flask(__name__)
CORS(app)

# --- Configuration ---
UPLOAD_FOLDER = 'temp_audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# --- Load the PyTorch model ---
print("Loading PyTorch emotion detection model...")
emotion_classifier = pipeline("audio-classification", model="superb/wav2vec2-base-superb-er")
print("Model loaded successfully.")

@app.route('/predict', methods=['POST'])
def predict_emotion():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files['audio']
    temp_filename = f"temp_{os.urandom(8).hex()}_{file.filename}"
    temp_filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
    
    try:
        file.save(temp_filepath)

        audio = AudioSegment.from_file(temp_filepath)
        audio = audio.set_frame_rate(16000).set_channels(1)
        
        samples = np.array(audio.get_array_of_samples()).astype(np.float32)
        audio_array = samples / (2**15)

        predictions = emotion_classifier(audio_array)
        primary_emotion = max(predictions, key=lambda x: x['score'])
        
        print(f"Prediction for {file.filename} successful: {primary_emotion['label']}")
        return jsonify({"emotion": primary_emotion['label']})

    except Exception as e:
        print(f"FATAL: Error processing audio.")
        traceback.print_exc()
        return jsonify({"error": "Failed to process audio file"}), 500
        
    finally:
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)