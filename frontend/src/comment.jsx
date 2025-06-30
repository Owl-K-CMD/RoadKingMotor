import { useState } from 'react'
import CommentForm from './commentForm'
import CommentsList from './commentdisplay'

const Comment = ({ car, currentUser }) => {
  const [refresh, setRefresh] = useState(0);
  const [isSectionVisible, setSectionVisible] = useState(false);

  const handleToggleVisibility  = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setSectionVisible(prev => !prev);
  }

  return (
    <div>
      <button onClick={handleToggleVisibility}>
        {isSectionVisible ? 'Hide Comments' : 'Show Comments'}
      </button>
      {isSectionVisible && (
        <div>
      <CommentsList carId={car.id} key={refresh} />
      {currentUser && <CommentForm carId={car.id} onCommentPosted={() => setRefresh(r => r + 1)} />}
    </div>
      )}
    </div>
  )
}

export default Comment