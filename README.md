# Open Scribe

Open Scribe is an AI-powered medical scribe assistant that helps healthcare professionals convert their spoken consultations into properly formatted medical notes.

## Preview
https://www.linkedin.com/feed/update/urn:li:activity:7321238297773555712

## Features

- **Real-time Audio Recording**: Record medical consultations directly through the browser
- **Audio Upload**: Support for uploading pre-recorded audio files
- **Speech-to-Text Transcription**: Powered by OpenAI's Whisper model
- **AI-Powered Formatting**: Converts raw transcriptions into structured medical notes using GPT-4
- **Intuitive Interface**: Simple, user-friendly design with recording controls
- **Audio Playback**: Review recordings before processing
- **Download Capability**: Save audio recordings for future reference

## Tech Stack

- **Frontend**:
  - React.js
  - CSS3
  - MediaRecorder API for audio recording

- **Backend**:
  - Node.js
  - Express.js
  - OpenAI API (Whisper & GPT-4)
  - Multer for file handling

## Prerequisites

- Node.js (v14 or higher)
- Yarn package manager
- OpenAI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ashishbamania/open-scribe.git
   cd open-scribe
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   yarn install

   # Install frontend dependencies
   cd ../frontend
   yarn install
   ```

3. Configure environment variables:
   ```bash
   # In the backend directory
   cp .env.example .env
   ```
   Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development servers:
   ```bash
   # From the root directory
   yarn start
   ```
   This will start both the frontend server on port 3000 and backend server on port 3001 concurrently.
   

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Click the "Start Recording" button to begin a new consultation
3. Speak clearly into your microphone
4. Click "Stop Recording" when finished
5. Review the recording using the playback controls
6. Click "Process Recording" to generate the medical notes
7. Review and download the formatted notes

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository.

