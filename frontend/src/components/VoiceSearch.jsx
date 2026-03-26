import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const VoiceSearch = ({ onTranscript }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await sendAudioToServer(audioBlob);

                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast.error('Microphone access denied');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioToServer = async (audioBlob) => {
        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.webm');

            const response = await api.post('/voice/transcribe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success && response.data.data.text) {
                onTranscript(response.data.data.text);
                toast.success('Voice search successful!');
            }
        } catch (error) {
            console.error('Error transcribing audio:', error);
            toast.error('Failed to transcribe audio');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`p-3 rounded-full transition-all duration-300 ${isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isRecording ? 'Stop recording' : 'Start voice search'}
            >
                {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : isRecording ? (
                    <FaStop />
                ) : (
                    <FaMicrophone />
                )}
            </button>
            {isRecording && (
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
                    Recording...
                </span>
            )}
        </div>
    );
};

export default VoiceSearch;
