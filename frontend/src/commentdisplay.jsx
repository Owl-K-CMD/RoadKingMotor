
import { useEffect, useState } from 'react';
import commentAct from './axios/commentAxios.js';
import StarRating from './starRating.jsx';
import CommentForm from './commentForm.jsx';
import style from './module/styleComment.module.css';

const CommentsList = ({ carId, refresh, onCommentPosted }) => {
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    if (!carId) return;

    const fetchCommentsForCar = async () => {
      try {
        const fetchedComments = await commentAct.getComments(carId);

        const structuredComments = fetchedComments.map(comment => ({
          ...comment,
          children: []
        }));

        const commentMap = new Map(structuredComments.map(comment => [comment.id, comment]));

        structuredComments.forEach(comment => {
          if (comment.parentComment) {
            const parent = commentMap.get(comment.parentComment);
            if (parent) {
              parent.children.push(comment);
            }
          }
        });

        const topLevelComments = structuredComments.filter(comment => !comment.parentComment);
        setComments(topLevelComments);
      } catch (error) {
        console.error('Failed to fetch comments', error);
        setComments([]);
      }
    };

    fetchCommentsForCar();
  }, [carId, refresh]);

  const renderComments = (comments) => {
    return comments.map((comment) => (
      <div
        key={comment.id}
        className={`${style.comment} ${comment.parentComment ? style.childComment : ''}`}
      >
        <small>{comment.user ? comment.user.userName : 'Anonymous'}</small>
        {/*<StarRating rating={comment.rating} size="0.6rem" />*/}
        <div className={style.commentandrepply}>
        <p>{comment.comment}</p>
                  <p><small className={style.date}>{new Date(comment.createdAt).toLocaleString()}</small></p>
        <p>
        <button   className={style.replybutton}
          onClick={(event) => {
            setReplyingTo(comment.id);
            event.stopPropagation();
            event.preventDefault();
          }}>Reply
        </button></p>
</div>
        {comment.children && comment.children.length > 0 && (
          <div className={style.nestedComments}>
            {renderComments(comment.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div>
      <div className={style.commentBox}>
        {comments.length > 0
          ? renderComments(comments)
          : <p>No comments yet. Be the first to comment!</p>
        }
      </div>

      <div className={style.commentFormWrapper}>
        <CommentForm
          carId={carId}
          parentCommentId={replyingTo}
          onCommentPosted={() => {
            onCommentPosted();
            setReplyingTo(null);
          }}
        />
      </div>
    </div>
  );
};

export default CommentsList;
