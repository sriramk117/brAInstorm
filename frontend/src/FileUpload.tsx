import React, { useState } from 'react';

const FileUpload: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setAudioFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData();
        if (audioFile) {
            formData.append('file', audioFile);

            try {
                const response = await fetch('http://localhost:8000/api/transcribe', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setTranscription(data.text); // Adjust based on the response structure
                } else {
                    console.error('Transcription failed');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="audio/*" onChange={handleFileChange} required />
                <button type="submit">Transcribe Audio</button>
            </form>
            {transcription && (
                <div>
                    <h3>Transcription:</h3>
                    <p>{transcription}</p>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
