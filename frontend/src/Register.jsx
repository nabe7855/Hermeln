import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  // フォームの入力値を保存するための場所を準備
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // バックエンドからの返事を保存する場所

 // 「登録」ボタンが押された時の処理
const handleSubmit = async (e) => {
  e.preventDefault(); // フォームのデフォルトの送信動作をキャンセル
  setMessage('登録中...');

  try {
    const response = await fetch('http://localhost:5000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // エラーメッセージを表示
      throw new Error(data.error || '何らかのエラーが発生しました。');
    }

// 成功メッセージを表示
setMessage(data.message);
const userId = data.user_id; // バックエンドから返されたユーザーIDを取得

// 1秒後に、ユーザーIDを「お土産」に持たせて、言語設定ページにワープ！
setTimeout(() => {
  navigate('/language-settings', { state: { userId: userId } });
}, 1000);

  } catch (error) {
    // エラーをキャッチしてメッセージを表示
    setMessage(`登録エラー: ${error.message}`);
  }
};

  return (
 <div className="register-container">
    <h2>ユーザー登録</h2>
    <form onSubmit={handleSubmit} className="register-form">
      <div>
        <label>ユーザー名:</label>
          <input
    type="text"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    required
  />
      </div>
      <div>
        <label>メールアドレス:</label>
        <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
  />
      </div>
      <div>
        <label>パスワード:</label>
        <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
      </div>
      <button type="submit" className="register-button">登録</button>
    </form>
    {/* メッセージの表示も、成功かエラーかで色が変わるようにする */}
    {message && <p className={`message ${!message.includes('エラー') ? 'success' : ''}`}>{message}</p>}
  </div>
  );
};

export default Register;