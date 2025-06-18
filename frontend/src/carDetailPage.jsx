import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import motoract from './cars'; // Assuming this is your service module
import styleCarDetails from './module/styleCarDetails.module.css'; // You can reuse or create new styles

const CarDetailPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (carId) {
      setLoading(true);
      setError(null);
      // Assuming your motoract service has a getById method
      // If not, you'll need to add it to your ./cars.js file
      // e.g., const getById = (id) => axios.get(`${BASE_URL}/cars/${id}`).then(res => res.data);
      motoract.getById(carId) 
        .then((data) => {
          setCarDetails(data);
        })
        .catch((err) => {
          console.error(`Error fetching details for car ID ${carId}:`, err);
          setError(err.message || "Failed to fetch car details.");
          setCarDetails(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError("No car ID provided.");
      setLoading(false);
    }
  }, [carId]);

  const handleImageNavigation = (direction) => {
    if (!carDetails || !Array.isArray(carDetails.images) || carDetails.images.length === 0) {
      return;
    }
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carDetails.images.length);
    } else {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + carDetails.images.length) % carDetails.images.length);
    }
  };

  if (loading) {
    return <div className={styleCarDetails.loading}>Loading car details...</div>;
  }

  if (error) {
    return <div className={styleCarDetails.error}>Error: {error} <button onClick={() => navigate('/')}>Go Home</button></div>;
  }

  if (!carDetails) {
    return <div className={styleCarDetails.notFound}>Car not found. <button onClick={() => navigate('/')}>Go Home</button></div>;
  }

  // Determine the image source (handles string or array)
  let imageToDisplay = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-no-image"; // Default placeholder
  if (carDetails.images) {
    if (Array.isArray(carDetails.images) && carDetails.images.length > 0) {
      imageToDisplay = carDetails.images[currentImageIndex];
    } else if (typeof carDetails.images === 'string' && carDetails.images.trim() !== '') {
      imageToDisplay = carDetails.images;
    }
  }
  
  const canNavigateImages = Array.isArray(carDetails.images) && carDetails.images.length > 1;


  return (
    <div className={styleCarDetails.carDetailPageContainer}> {/* Add styleCarDetailss for this container */}
      <button onClick={() => navigate(-1)} className={styleCarDetails.backButton}>&larr; Back</button>
      
      <h1 className={styleCarDetails.carDetailTitle}>{carDetails.brand} - {carDetails.model}</h1>
      
      <div className={styleCarDetails.carDetailLayout}> {/* For layout, e.g., image on left, details on right */}
        <div className={styleCarDetails.carDetailImageSection}>
          <img 
            src={imageToDisplay} 
            alt={`${carDetails.model} ${Array.isArray(carDetails.images) ? currentImageIndex + 1 : ''}`} 
            className={styleCarDetails.carDetailImage} 
          />
          {canNavigateImages && (
            <div className={styleCarDetails.imageNavigation}>
              <button onClick={() => handleImageNavigation('prev')} className={styleCarDetails.imageNavButton}>&lt; Prev</button>
              <span>{currentImageIndex + 1} / {carDetails.images.length}</span>
              <button onClick={() => handleImageNavigation('next')} className={styleCarDetails.imageNavButton}>Next &gt;</button>
            </div>
          )}
        </div>

        <div className={styleCarDetails.carDetailInfoSection}>
          <p><strong>Price:</strong> {carDetails.price} $</p>
          <p><strong>Year:</strong> {carDetails.year}</p>
          <p><strong>Brand:</strong> {carDetails.brand}</p>
          <p><strong>Model:</strong> {carDetails.model}</p>
          <p><strong>Made In:</strong> {carDetails.madeIn}</p>
          <p><strong>Mileage:</strong> {carDetails.mileage} km</p>
          <p><strong>Fuel Type:</strong> {carDetails.fuelType}</p>
          <p><strong>Transmission:</strong> {carDetails.transmission}</p>
          <p><strong>Body Type:</strong> {carDetails.bodyType}</p>
          <p><strong>Color:</strong> {carDetails.color}</p>
          <p><strong>Seats:</strong> {carDetails.seats}</p>
          <p><strong>Doors:</strong> {carDetails.doors}</p>
          <p><strong>Engine Size:</strong> {carDetails.engineSize}</p>
          <p><strong>Status:</strong> {carDetails.status}</p>
          {carDetails.otherDescription && <p><strong>Other Details:</strong> {carDetails.otherDescription}</p>}
          <p><strong>Listed On:</strong> {new Date(carDetails.createdAt).toLocaleDateString()}</p>
          
          {/* Add to Cart, Contact Seller buttons can be added here if needed */}
          <div className={styleCarDetails.carDetailActions}>
            <button className={styleCarDetails.button}>Buy Now</button>
            <button className={styleCarDetails.button}>Contact Seller</button>
            {/* <button className={styleCarDetails.button} onClick={() => handleAddToCart(carDetails)}>Add to Cart</button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailPage;
