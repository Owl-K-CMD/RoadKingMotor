import { useState } from 'react'
import commentAct from './axios/commentAxios'
import style from './module/styleComment.module.css'


const CommentForm = ({ carId, onCommentPosted, parentCommentId = null}) => {
     const [comment, setComment] = useState('')
     const [rating, setRating] = useState(0)
     const [hover, setHover] = useState(0)
  
     const [error, setError] = useState('')

  const handleSubmit = async(e) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      alert('Please select a star rating.')
      return
    }

    try {
      const commentData = { comment: comment, rating: rating, car: carId, parentComment: parentCommentId };
      await commentAct.createComment(commentData)
      setComment('')
      setRating(0)
      onCommentPosted()
    } catch (error) {
      console.error('Failed to post comment', error.response ? error.response.data : error.message)
      setError('Failed to post comment. Please try again.')
    }
  }

  return (
    <form className={style.commentForm} onSubmit={handleSubmit}

    onClick= {(event) =>{
      event.stopPropagation()
    }}
      
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className={style.commentFormInput}>
        {[...Array(5)].map((star, index) => {
          const ratingValue = index + 1

          return (
            <button
            type="button"
            key={ratingValue}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              color: ratingValue<= (hover || rating) ? '#ffc107': '#e4e5e9'
            }}
            onClick={(event) => {{setRating(ratingValue)}
          event.stopPropagation()
          event.preventDefault()
          }}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
    
          
            >
              &#9733;
            </button> 
          )
        })}
        </div>
<div className={style.textareaAndPost}>
              <textarea
              className={style.textarea}
       value={comment}
       onChange={(e) => setComment(e.target.value)}
       placeholder="Your comment..." 
       required
       onClick={(event) => {event.preventDefault();
    event.stopPropagation();
  }} 
       />
      <button className={style.postButton} type="submit">Post</button>
      </div>
    </form>
  )
}
export default CommentForm;