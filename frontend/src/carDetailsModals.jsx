import { useState, useEffect } from 'react';
import style from './module/style.module.css';
import styleCarDetails from './module/styleCarDetails.module.css';
import styleCartContent from './module/styleCartContent.module.css';
import AverageRating from './AverageRating.jsx';
import CommentsList from './commentdisplay.jsx';
import CommentForm from './commentForm.jsx';

const CarDetailModal = ({ car, onClose, onAddToCart, onOpenChat, currentUser, onCommentPosted, refresh }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [car]);

  const handleImageNavigation = (direction) => {
    if (!car || !Array.isArray(car.images) || car.images.length === 0) {
      return;
    }
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % car.images.length);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + car.images.length) % car.images.length);
    }
  };

  let imageToDisplay = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-no-image";
  if (car.images) {
    if (Array.isArray(car.images) && car.images.length > 0) {
      imageToDisplay = car.images[currentImageIndex];
    } else if (typeof car.images === 'string' && car.images.trim() !== '') {
      imageToDisplay = car.images;
    }
  }
  
  const canNavigateImages = Array.isArray(car.images) && car.images.length > 1;

  let rawFirstImageUrl = null;
  if (Array.isArray(car.images) && car.images.length > 0 && typeof car.images[0] === 'string' && car.images[0].trim() !== '') {
    rawFirstImageUrl = car.images[0].trim();
  } else if (typeof car.images === 'string' && car.images.trim() !== '') {
    rawFirstImageUrl = car.images.trim();
  }
  const firstImageUrlForBackground = rawFirstImageUrl ? encodeURI(rawFirstImageUrl) : null;


  return (
    <div className={style.modalOverlay} onClick={onClose}>
      <div
       className={style.carProparty}
       onClick={(e) => e.stopPropagation()}>

     <div
      className={`${style.carproparty} ${styleCartContent.expandedDetailView}`}
      onClick={(e) => e.stopPropagation()}
      style={firstImageUrlForBackground ? {
        backgroundImage: `url(${firstImageUrlForBackground})`,
      } : {}}
    >

        <button onClick={onClose} className={style.modalCloseButton}>&times;</button>
     
        <h1 className={styleCarDetails.carDetailTitle}>{car.brand} - {car.model}</h1>
        
        
          <div className={style.imgandits}>
            <img 
              src={imageToDisplay} 
              alt={`${car.model} ${Array.isArray(car.images) ? currentImageIndex + 1 : ''}`} 
              className={style.img} 
            />
            {canNavigateImages && (
              <div className={style.imageNavigation}>
                <button onClick={() => handleImageNavigation('prev')}
                 className={style.imageNavButton}>&lt; Prev</button>
                <span>{currentImageIndex + 1} / {car.images.length}</span>
                <button onClick={() => handleImageNavigation('next')}
                 className={style.imageNavButton}>Next &gt;</button>
              </div>
            )}
          </div>

          <div className={style.carProperty}>
            <p><strong>Price:</strong> {car.price} $</p>
            <p><strong>Year:</strong> {car.year}</p>
            <p><strong>Brand:</strong> {car.brand}</p>
            <p><strong>Made In:</strong> {car.madeIn}</p>
            <p><strong>Mileage:</strong> {car.mileage} km</p>
            <p><strong>Fuel Type:</strong> {car.fuelType}</p>
            <p><strong>Transmission:</strong> {car.transmission}</p>
            <p><strong>Body Type:</strong> {car.bodyType}</p>
            <p><strong>Color:</strong> {car.color}</p>
            <p><strong>Seats:</strong> {car.seats}</p>
            <p><strong>Doors:</strong> {car.doors}</p>
            <p><strong>Engine Size:</strong> {car.engineSize}</p>
            <p><strong>Status:</strong> {car.status}</p>
            {car.otherDescription && <p><strong>Other Details:</strong> {car.otherDescription}</p>}
            <p><strong>Listed On:</strong> {new Date(car.createdAt).toLocaleDateString()}</p>
            
            <div className={style.newbutton}>
              <button className={style.button}>Buy Now</button>
              <button className={style.button} onClick={() => onAddToCart(car)}>Add to Cart</button>
              <button className={style.button} onClick={() => onOpenChat(car)}>Contact Seller</button>
            </div>
          </div>
        
        <div className={styleCarDetails.commentsSection}>
          <h2 className={styleCarDetails.commentsTitle}>Ratings & Comments</h2>
          <AverageRating carId={car.id} refresh={refresh} />
          <CommentsList carId={car.id} refresh={refresh} />
          {currentUser ? <CommentForm carId={car.id} onCommentPosted={onCommentPosted} /> : <p>You must be logged in to post a comment.</p>}
        </div>
     </div>
      </div>
    </div>
  );
};

export default CarDetailModal;

