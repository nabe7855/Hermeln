import React, { useState, useEffect } from 'react';
import './FeedPage.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // バックエンドから投稿一覧を取得するAPIを叩く！
        const response = await fetch('http://localhost:5000/api/posts');
        if (!response.ok) {
          throw new Error('投稿の取得に失敗しました。');
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); // 最初の1回だけ実行

  if (isLoading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

    return (
    <div className="feed-container">
      <h2>みんなの投稿</h2>
      {posts.length === 0 ? (
        <p>まだ投稿がありません。</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <p className="post-author">投稿者: {post.author_username}</p>
            <div className="post-content">
              <strong>お題:</strong> {post.text_content}
            </div>
            <audio src={post.audio_url} controls />
          </div>
        ))
      )}
    </div>
  );
};

export default FeedPage;