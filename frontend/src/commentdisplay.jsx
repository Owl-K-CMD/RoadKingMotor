import { useEffect, useState } from 'react'
import commentAct from './axios/commentAxios.js'

const CommentsList = ({ carId }) => {
  const [comments, setComments] = useState([])
    
  
  useEffect(() => {
       if (!carId) {
        return;
       }
  const fetchCommentsForCar = async () => {
    try {
      const fetchedComments = await commentAct.fetchComments(carId);
      setComments(fetchedComments || []);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  }
  fetchCommentsForCar();
  
  }, [carId])

  return (
    <div>
      {comments.length > 0 ? comments.map((c) => (
        <div key={c.id}>
          <strong>{c.userName}</strong> ({c.rating}★):
          <p>{c.comment}</p>
        </div>
      )): <p>No comments yet. Be the first tocomment!</p>
    }
    </div>
  )
}

export default CommentsList
