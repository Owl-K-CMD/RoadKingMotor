import React from 'react';

const StarRating = ({
  totalStars = 5,
  rating = 0,
  hover = 0,
  onRatingChange = () => {},
  onHoverChange = () => {},
  interactive = false,
  size = '2rem',
}) => {
  return (
    <div>
      {[...Array(totalStars)].map((_, index) => {
        const ratingValue = index + 1;
        const starStyle = {
          backgroundColor: 'transparent',
          border: 'none',
          outline: 'none',
          cursor: interactive ? 'pointer' : 'default',
          fontSize: size,
          color: ratingValue <= (hover || rating) ? '#ffc107' : '#e4e5e9',
        };

        if (interactive) {
          return (
            <button
              type="button"
              key={ratingValue}
              style={starStyle}
              onClick={() => onRatingChange(ratingValue)}
              onMouseEnter={() => onHoverChange(ratingValue)}
              onMouseLeave={() => onHoverChange(0)}
            >
              &#9733;
            </button>
          );
        }

        return <span key={ratingValue} style={starStyle}>&#9733;</span>;
      })}
    </div>
  );
};

export default StarRating;

