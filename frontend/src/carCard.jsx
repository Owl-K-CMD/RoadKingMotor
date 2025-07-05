import { useState } from 'react';
import style from './module/style.module.css';

const CarCard = ({ car, onCardClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageNavigation = (event, direction) => {
    event.stopPropagation(); // Prevent the modal from opening when clicking image nav buttons
    if (!car || !Array.isArray(car.images) || car.images.length === 0) {
      return;
    }

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentImageIndex + 1) % car.images.length;
    } else {
      nextIndex = (currentImageIndex - 1 + car.images.length) % car.images.length;
    }
    setCurrentImageIndex(nextIndex);
  };

  let imageToDisplay = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-no-image";
  if (car.images) {
    if (Array.isArray(car.images) && car.images.length > 0) {
      imageToDisplay = car.images[currentImageIndex];
    } else if (typeof car.images === 'string' && car.images.trim() !== '') {
      imageToDisplay = car.images;
    }
  }

  return (
    <div className={style.carproparty} onClick={() => onCardClick(car)}>
      <div className={style.imgandits}>
        <img src={imageToDisplay} alt={`${car.model}`} className={style.img} />
        {Array.isArray(car.images) && car.images.length > 1 && (
          <div className={style.imageNavigation}>
            <button onClick={(e) => handleImageNavigation(e, 'prev')} className={style.imageNavButton}>
              &lt; Prev
            </button>
            <span className={style.imageCounter}>
              {currentImageIndex + 1} / {car.images.length}
            </span>
            <button onClick={(e) => handleImageNavigation(e, 'next')} className={style.imageNavButton}>
              Next &gt;
            </button>
          </div>
        )}
      </div>
      <div className={style.carpropartyOtherProperty}>
        <div className={style.carProperty}>
          <div className={style.carpropartyp}><h3 className={style.carContext}>Model: </h3>{car.model}</div>
          <div className={style.carpropartyp}><h3 className={style.carContext}>Price: </h3>{car.price} $</div>
          <div className={style.carpropartyp}><h3 className={style.carContext}>Year: </h3>{car.year}</div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;


