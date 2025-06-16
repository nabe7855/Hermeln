import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css'; // 後で作成するCSSファイル
import { useAuth } from './context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // LoginPage.jsx の handleSubmit 関数

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('ログイン中...');

  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'ログインに失敗しました。');
    }

    // --- ここからが、ログイン成功後の重要な処理！ ---

        // localStorageに直接保存する代わりに、login関数を呼び出す！
    login(data); 
    
    setMessage(data.message);
    
    // 1. 受け取った「許可証」とユーザー情報を、ブラウザに保存する
    localStorage.setItem('token', data.token);
    localStorage.setItem('user_id', data.user_id);
    localStorage.setItem('username', data.username);
    
    setMessage(data.message);
    
    // 2. 成功したら、フィード画面にワープ！
    setTimeout(() => {
      navigate('/feed'); 
    }, 1000);

  } catch (error) {
    setMessage(`エラー: ${error.message}`);
  }
};

  return (
    <div className="login-container">
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit} className="login-form">
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
        <button type="submit" className="login-button">ログイン</button>
      </form>
      {message && <p className="message">{message}</p>}
      <p className="register-link">
        アカウントをお持ちでないですか？ <Link to="/register">新規登録はこちら</Link>
      </p>
    </div>
  );
};

export default LoginPage;