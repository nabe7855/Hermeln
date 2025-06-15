import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './AiChat.css'; // 後で作成するCSSファイル
import { useNavigate } from 'react-router-dom';

const AiChat = () => {
  // 会話の履歴を保存する場所
  const [messages, setMessages] = useState([]);
  // ユーザーの入力値を保存する場所
  const [input, setInput] = useState('');
  
  const location = useLocation();
  const userId = location.state?.userId;
  const navigate = useNavigate();

  // 最初のAIのメッセージを設定
// useEffectを、ユーザー情報を取得する機能に書き換える
useEffect(() => {
  // ユーザーIDがなければ、何もしない
  if (!userId) return;

  const fetchUserData = async () => {
    try {
      // 新しく作ったAPIを叩いて、ユーザー名を取得
      const response = await fetch(`http://localhost:5000/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('ユーザー情報の取得に失敗しました。');
      }
      const userData = await response.json();
      
      // 取得したユーザー名を使って、最初のメッセージを設定
      setMessages([
        { sender: 'ai', text: `こんにちは！${userData.username}さん。自己紹介文を作るために、あなたの趣味や好きなことを教えてください。` }
      ]);

    } catch (error) {
      setMessages([
        { sender: 'ai', text: `エラー: ${error.message}` }
      ]);
    }
  };

  fetchUserData();
  
}, [userId]); // userIdが変わった時に、この処理を実行する

 // 送信ボタンが押された時の処理
const handleSend = async () => { // async を追加！
  if (input.trim() === '' || !userId) return;

  const userMessage = { sender: 'user', text: input };
  
  // ユーザーのメッセージと、「考え中...」というAIのメッセージを先に追加
  setMessages([...messages, userMessage, { sender: 'ai', text: '素晴らしい趣味ですね！自己紹介文を考えています...' }]);
  
  const hobbies = input; // ユーザーの入力を趣味として扱う
  setInput('');

  try {
    // バックエンドのAI生成APIを叩く！
    const response = await fetch(`http://localhost:5000/api/users/${userId}/generate-intro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hobbies: hobbies, // ユーザーが入力した趣味を送る
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'AIが自己紹介文の生成に失敗しました。');
    }

    // AIからの本当の返事を、まず変数に保存
const newIntroText = data.intro_text;

// 「考え中...」のメッセージを、AIが生成した自己紹介文に置き換える
setMessages(prevMessages => {
  const newMessages = prevMessages.slice(0, -1);
  return [...newMessages, { sender: 'ai', text: newIntroText }];
});

// データを「お土産」に持たせて、1.5秒後に録音ページにワープ！
setTimeout(() => {
  navigate('/recording', { state: { userId: userId, introText: newIntroText } });
}, 1500); // 1500ミリ秒 = 1.5秒

  } catch (error) {
    // エラーが発生した場合も、最後のメッセージをエラーメッセージに置き換える
     setMessages(prevMessages => {
      const newMessages = prevMessages.slice(0, -1);
      return [...newMessages, { sender: 'ai', text: `エラー: ${error.message}` }];
    });
  }
};

  return (
  <div className="chat-container">
    <div className="chat-header">AI自己紹介アシスタント</div>
    <div className="messages-area">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.sender}`}>
          {/* <p>タグは不要になることが多い */}
          {msg.text}
        </div>
      ))}
    </div>
    <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="メッセージを入力..."
        />
        <button onClick={handleSend}>送信</button>
      </div>
    </div>
  );
};

export default AiChat;