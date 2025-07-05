import { useEffect, useState } from 'react'
import commentAct from './axios/commentAxios.js'
import StarRating from './starRating.jsx'


const CommentsList = ({ carId, refresh}) => {
  const [comments, setComments] = useState([])
    
  
  useEffect(() => {
       if (!carId) {
        return;
       }
  const fetchCommentsForCar = async () => {
    try {
      const fetchedComments = await commentAct.getComments(carId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to fetch comments', error);
      setComments([]);
    }
  }
  fetchCommentsForCar();
  
  }, [carId, refresh])

  return (
    <div>
      {comments.length > 0 ? comments.map((c) => (
        <div key={c.id}>
          <strong>{c.user ? c.user.userName : 'Anonymous'}</strong> {/*({c.rating}★)*/}:
          <StarRating rating={c.rating} size="1rem" />
          <p>{c.comment}</p>
        </div>
      )): <p>No comments yet. Be the first tocomment!</p>
    }
    </div>
  )
}

export default CommentsList
