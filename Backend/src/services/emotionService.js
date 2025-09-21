import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

// The URL of your new Python microservice
const PYTHON_SERVICE_URL = 'http://localhost:5001/predict';

export async function detectEmotion(audioFilePath) {
    try {
        const form = new FormData();
        form.append('audio', fs.createReadStream(audioFilePath));

        // Make a POST request to the Python service
        const response = await axios.post(PYTHON_SERVICE_URL, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        // Return the emotion received from the Python service
        return response.data.emotion;

    } catch (error) {
        console.error('Error calling Python emotion service:', error.response ? error.response.data : error.message);
        return 'unknown'; // Fallback to 'unknown' if the service fails
    } finally {
        // The controller will handle deleting the original audio file
    }
}