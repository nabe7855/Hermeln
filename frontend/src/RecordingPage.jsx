import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // useNavigateを追加
import './RecordingPage.css';

const RecordingPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null); 
  
  const navigate = useNavigate();
  const location = useLocation();
  const introText = location.state?.introText || "（自己紹介文がありません）";
  const userId = location.state?.userId;

  const handleStartRecording = async () => {
    setAudioURL(''); // 新しい録音を開始する前に、前の録音をクリア
    audioBlobRef.current = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = audioBlob;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setMessage("マイクへのアクセスが拒否されました。");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const handlePost = async () => {
    if (!audioBlobRef.current || !userId) {
      setMessage("録音データまたはユーザーIDがありません。");
      return;
    }

    setIsUploading(true);
    setMessage("投稿中...");

    const formData = new FormData();
    formData.append('audio', audioBlobRef.current, `${userId}_${Date.now()}.webm`);
    formData.append('text_content', introText);
    formData.append('user_id', userId);

    try {
      const response = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '投稿に失敗しました。');
      }
      
      setMessage(data.message);
      setTimeout(() => {
        setMessage(data.message);
        // 成功したら、2秒後にフィード画面にワープ！
        setTimeout(() => {
        navigate('/feed'); // TODO を外して、有効化！
        }, 2000);
        // navigate('/feed'); 
        setMessage('投稿完了！フィード画面へ移動します...');
      }, 2000);

    } catch (error) {
      setMessage(`エラー: ${error.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="recording-container">
      <h2>AIが生成した自己紹介文</h2>
      <div className="intro-text-area">
        <p>{introText}</p>
      </div>
      
      <div className="recording-controls">
        {!isRecording ? (
          <button onClick={handleStartRecording} className="record-button start">録音開始 ●</button>
        ) : (
          <button onClick={handleStopRecording} className="record-button stop">録音停止 ■</button>
        )}
      </div>

      {audioURL && (
        <div className="playback-area">
          <h3>録音の確認:</h3>
          <audio src={audioURL} controls />
        </div>
      )}
      
      <button onClick={handlePost} disabled={!audioURL || isUploading} className="post-button">
        {isUploading ? '投稿中...' : 'この音声で投稿する'}
      </button>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default RecordingPage;