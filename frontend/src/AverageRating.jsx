import { useState, useEffect } from 'react'
import commentAct from './axios/commentAxios'
import StarRating from './starRating'

const Star = ({ filled }) => (
  <span style={{ color: filled ? '#ffc107' : '#e4e5e9', fontSize: '1.5rem'}}>
    &#9733;
  </span>
)

const AverageRating = ({ carId, refresh }) => {
  const [averageRating, setAverageRating] = useState(0)
   const [reviewCount, setReviewCount] = useState(0)

  useEffect(() => {
    const fetchCommentAndCalcRating = async () => {
      try {
        const comments = await commentAct.getComments(carId)
  if (comments && comments.length > 0) {
    const validRatings = comments.filter(c => typeof c.rating === 'number' && c.rating > 0);
                    if (validRatings.length > 0) {
                        const totalRating = validRatings.reduce((acc, comment) => acc + comment.rating, 0);
                        const avg = totalRating / validRatings.length;
                        setAverageRating(avg);
                        setReviewCount(validRatings.length);
                    } else {
                        setAverageRating(0);
                        setReviewCount(0);
                    }
                } else {
                    setAverageRating(0);
                    setReviewCount(0);
                }
            } catch (error) {
                console.error(`Failed to fetch comments for rating for car ${carId}`, error);
                setAverageRating(0);
                setReviewCount(0);
            }
          }

          if (carId) {
            fetchCommentAndCalcRating()
          }
          }, [carId, refresh]);

          const roundedRating = Math.round(averageRating);

          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
              
              <div>
                {[...Array(5)].map((_, index) =>(
                  <Star key={index} filled={index < roundedRating} />
                ))}
              </div>
              
              <span style={{ fontWeight: 'bold'}}>
                {averageRating > 0 ? averageRating.toFixed(1) : 'No rating'}
              </span>
              <span>
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )
        }

        export default AverageRating;