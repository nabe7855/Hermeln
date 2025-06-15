import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './LanguageSettings.css';

const LanguageSettings = () => {
  const [nativeLanguage, setNativeLanguage] = useState('japanese');
  const [learningLanguage, setLearningLanguage] = useState('english');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  
  // 前のページ（登録画面）から、ユーザーIDを受け取る
  const location = useLocation();
  const userId = location.state?.userId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('設定を保存中...');
    
    // ユーザーIDがない場合は、エラー処理（念のため）
    if (!userId) {
      setMessage('ユーザーIDが見つかりません。もう一度登録からやり直してください。');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/language`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          native_language: nativeLanguage,
          learning_language: learningLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '設定の保存に失敗しました。');
      }

      // 成功したら、AIチャットページにワープ！
      navigate('/ai-chat', { state: { userId: userId } });

    } catch (error) {
      setMessage(`エラー: ${error.message}`);
    }
  };

  return (
    <div className="settings-container">
      <h2>言語設定</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>あなたの母語を選択してください</label>
          <select value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)}>
            <option value="japanese">日本語</option>
            <option value="english">English</option>
          </select>
        </div>
        <div>
          <label>学習したい言語を選択してください</label>
          <select value={learningLanguage} onChange={(e) => setLearningLanguage(e.target.value)}>
            <option value="english">English</option>
            <option value="japanese">日本語</option>
          </select>
        </div>
      <button type="submit" className="settings-button">次のステップへ</button>
    </form>
    {message && <p className="message">{message}</p>}
  </div>
  );
};

export default LanguageSettings;