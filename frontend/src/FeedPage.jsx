import React, { useState, useEffect } from 'react';
import './FeedPage.css';

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [newComment, setNewComment] = useState({});
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


const handleCommentSubmit = async (e, postId) => {
  e.preventDefault();
  const commentBody = newComment[postId];
  
  // TODO: ここに、現在ログインしているユーザーのIDを取得する処理が必要
  const currentUserId = 1; // とりあえず、1番のユーザーとして仮定

  if (!commentBody || !currentUserId) return;

  try {
    const response = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: commentBody,
        user_id: currentUserId,
      }),
    });

    if (!response.ok) {
      throw new Error('コメントの投稿に失敗しました。');
    }

    // 成功したら、フィードを再読み込みして、新しいコメントを表示する
    // (本当は、もっと効率的な方法があるが、まずはこれでOK！)
    window.location.reload();

  } catch (err) {
    console.error(err);
  }
};

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

          <div className="comments-section">
            <h4>コメント</h4>
            {post.comments.length > 0 ? (
              post.comments.map(comment => (
                <div key={comment.id} className="comment">
                  <strong>{comment.author_username}:</strong> {comment.body}
                </div>
              ))
            ) : (
              <p>まだコメントはありません。</p>
            )}
          </div>

            <form onSubmit={(e) => handleCommentSubmit(e, post.id)}>
              <input
                type="text"
                placeholder="コメントを追加..."
                value={newComment[post.id] || ''}
                onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
              />
              <button type="submit">送信</button>
            </form>
          </div>
        ))
      )}
    </div>
  );
};

export default FeedPage;