import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import Register from './Register.jsx';
import LanguageSettings from './LanguageSettings.jsx';
import './index.css';
import AiChat from './AiChat.jsx';
import RecordingPage from './RecordingPage.jsx';
import FeedPage from './FeedPage.jsx'; 


// ここで交通ルールを定義する
const router = createBrowserRouter([
  {
    path: '/', // ルートパス（最初のページ）
    element: <App />,
    // TODO: エラーページを後で追加する
  },
  {
    path: '/register', // 登録ページの住所
    element: <Register />,
  },
  {
    path: '/language-settings', // 言語設定ページの住所
    element: <LanguageSettings />,
  },

   {
    path: '/ai-chat', // AIチャット画面の住所
    element: <AiChat />,
  },

  {
      path: '/recording', // 録音ページの住所
      element: <RecordingPage />,
    },

    {
    path: '/feed', // フィード画面の住所
    element: <FeedPage />,
  },

]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);