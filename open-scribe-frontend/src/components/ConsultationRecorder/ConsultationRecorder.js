import React, { useState, useRef } from "react";
import "./ConsultationRecorder.css";

const ConsultationRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);
  const [transcription, setTranscription] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [formattedNote, setFormattedNote] = useState(null);
  const [isFormatting, setIsFormatting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const handleStartClick = () => {
    if (audioURL || transcription || formattedNote) {
      setShowStartModal(true);
    } else {
      startRecording();
    }
  };

  const confirmStart = () => {
    setShowStartModal(false);
    setAudioURL(null);
    clearResults();
    startRecording();
  };

  const handleStopClick = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
    }
    setShowStopModal(true);
  };

  const confirmStop = () => {
    setShowStopModal(false);
    stopRecording();
  };

  const cancelStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
    }
    setShowStopModal(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (!isPaused) {
        mediaRecorderRef.current.pause();
      } else {
        mediaRecorderRef.current.resume();
      }
      setIsPaused(!isPaused);
    }
  };

  const sendAudioForTranscription = async (audioBlob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const response = await fetch("http://localhost:3001/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const data = await response.json();
      setTranscription(data.transcription);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
      setIsPaused(false);

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        sendAudioForTranscription(audioBlob);
        chunksRef.current = [];
      };
    }
  };

  const formatConsultation = async () => {
    if (!transcription) return;

    setIsFormatting(true);
    try {
      const response = await fetch(
        "http://localhost:3001/format-consultation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transcription }),
        }
      );

      if (!response.ok) {
        throw new Error("Formatting failed");
      }

      const data = await response.json();
      setFormattedNote(data.formattedNote);
    } catch (error) {
      console.error("Error formatting consultation:", error);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setShowUploadModal(true);
  };

  const confirmUpload = async () => {
    setShowUploadModal(false);
    clearResults();

    try {
      await sendAudioForTranscription(selectedFile);
    } catch (error) {
      console.error("Error processing uploaded file:", error);
    } finally {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioURL;
    link.download = "consultation-recording.webm";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearResults = () => {
    setTranscription(null);
    setFormattedNote(null);
    setAudioURL(null);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        ?.getTracks()
        .forEach((track) => track.stop());
    }
    chunksRef.current = [];
  };

  return (
    <div className="consultation-recorder">
      <h2>Open Scribe</h2>
      <h3>AI-Powered Medical Consultation Assistant</h3>

      <div className="recording-controls">
        {!isRecording && (
          <>
            <button className="start-button" onClick={handleStartClick}>
              Start Recording
            </button>
            <button className="upload-button" onClick={triggerFileInput}>
              Upload Audio
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              style={{ display: "none" }}
            />
          </>
        )}

        {isRecording && (
          <>
            <button className="pause-button" onClick={pauseRecording}>
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button className="stop-button" onClick={handleStopClick}>
              Stop
            </button>
          </>
        )}
      </div>

      {audioURL && (
        <div className="audio-playback">
          <h3>Recording Playback</h3>
          <audio controls src={audioURL}>
            Your browser does not support the audio element.
          </audio>
          <button className="download-button" onClick={handleDownload}>
            Download Recording
          </button>
        </div>
      )}

      {isTranscribing && (
        <div className="transcription-status">
          <p>Transcribing audio...</p>
        </div>
      )}

      {transcription && (
        <div className="transcription-result">
          <h3>Transcription</h3>
          <p>{transcription}</p>
        </div>
      )}

      {transcription && !formattedNote && (
        <button
          className="scribe-button"
          onClick={formatConsultation}
          disabled={isFormatting}
        >
          {isFormatting ? "Formatting..." : "Format as Medical Note"}
        </button>
      )}

      {formattedNote && (
        <div className="formatted-note">
          <h3>Formatted Medical Note</h3>
          <pre>{formattedNote}</pre>
        </div>
      )}

      {showStartModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Start Recording</h3>
            {audioURL || transcription || formattedNote ? (
              <p>
                Do you want to start a new recording? Previous recording,
                transcription, and medical note will be erased.
              </p>
            ) : (
              <p>Do you want to start recording?</p>
            )}
            <div className="modal-buttons">
              <button className="modal-button confirm" onClick={confirmStart}>
                Yes, Start
              </button>
              <button
                className="modal-button cancel"
                onClick={() => setShowStartModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showStopModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Stop Recording</h3>
            <p>Are you sure you want to stop recording?</p>
            <div className="modal-buttons">
              <button className="modal-button confirm" onClick={confirmStop}>
                Yes, Stop
              </button>
              <button className="modal-button cancel" onClick={cancelStop}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Upload Audio</h3>
            <p>
              Do you want to upload this audio file? Any existing transcription
              will be cleared.
            </p>
            <div className="modal-buttons">
              <button className="modal-button confirm" onClick={confirmUpload}>
                Yes, Upload
              </button>
              <button
                className="modal-button cancel"
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRecorder;
