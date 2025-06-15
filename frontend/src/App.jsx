import React from 'react';
import { Link, Outlet } from 'react-router-dom'; // LinkとOutletをインポート
import './App.css';
import logo from './assets/logo.png';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Hermelnへようこそ！</h1>
        <nav>
          {/* あとでここにナビゲーションリンクを追加する */}
        </nav>
      </header>
      <main>
        <Outlet /> {/* ここに、子ルートのコンポーネントが表示される */}
      </main>
    </div>
  );
}

export default App;
