import React from 'react';

const CommentBox = ({ comment }) => {
  return (
    <div className="comment">
      <strong>{comment.author_username}:</strong>
      <span>{comment.body}</span>
    </div>
  );
};

export default CommentBox;
