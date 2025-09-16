import React, { useState, useEffect } from 'react'
import style from './module/styleComments.module.css'
import commentAct from './comment.js'

const Comments = ({ carId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    commentAct.getComments(carId)
    .then(initialComments => {
      console.log('All commens:', initialComments);
      setComments(initialComments)
      setLoading(false)
    }).catch(error => {
      setError(error)
      setLoading(false)
    }).finally(() => {
      setLoading(false)
    })
  }, [carId])

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
  };

  const handleReplySubmit = async (parentCommentId) => {
    try {
      await commentAct.createComments({ car: carId, parentComment: parentCommentId, comment: replyText });
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error("Error creating reply:", error)
    }
  }

  if (loading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div className={style.comments}>
      <div>Comments and rating</div>

      <ul>
        {comments.map(comment => (
          <li key={comment.id || comment._id}>
          <p><strong>Author:</strong><button>{comment.user.userName}</button></p>
          <p><strong>Comment:</strong> {comment.comment}</p>
          <p><strong>Rating:</strong> {comment.rating}</p>
          <p><small>{new Date(comment.createdAt).toLocaleString()}</small></p>
          <button onClick={() => handleReplyClick(comment.id)}>Reply</button>
          {replyingTo === comment.id && (
            <div>
              <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a Reply..."
              />
              <button onClick={() => handleReplySubmit(comment.id)}>Post</button>
            </div>
          )}
          </li>
        ))}
      </ul>

    </div>
  )
}
export default Comments;