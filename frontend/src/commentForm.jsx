import { useState } from 'react'
import commentAct from './axios/commentAxios'

const CommentForm = ({ carId, onCommentPosted }) => {
     const [comment, setComment] = useState('')
     const [rating, setRating] = useState(0)
     const [hover, setHover] =useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a star rating.')
      return
    }

    try {
      const commentData = { text: comment,rating: rating };
      await commentAct.createComment(carId, commentData)
      setComment('')
      setRating(0)
      onCommentPosted()
    } catch (error) {
      console.error('Failed to post comment', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} onClick={(event) => {
    event.preventDefault()
  event.stopPropagation()
}}>
      <textarea
       value={comment}
       onChange={(e) => setComment(e.target.value)}
       placeholder="Your comment..." 
       required 
       />
       <div >
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
              fontSize: '2rem',
              color: ratingValue<= (hover || rating) ? '#ffc107': '#e4e5e9'
            }}
            onClick={() => setRating(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
            >
              &#9733;
            </button> 
          )
        })}
        </div>
      <button type="submit">Post</button>
    </form>
  )
}
export default CommentForm;