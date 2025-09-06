import { useState, useEffect } from 'react'
import customCaract from './axios/customCar.js'
import CustomCar from './customCar.jsx'
import style from './module/customCarHomeStyle.module.css'



const CustomCarHome = ({ onClose }) => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [userCustomCar, setUserCustomCar] = useState([])
  const [expandedCarIds, setExpandedCarIds] = useState([]);
  const [isListVisible, setIsListVisible] = useState(true);
  const [isCustomCarVisible, setIsCustomCarVisible] = useState(false);


useEffect(() => {
    const fetchUserCustomCar = async () => {
      const storedUser = localStorage.getItem('currentUser')
      if (!storedUser) {
        console.error('User not found in localStorage. Please log in.')
        setErrorMessage('User not found. Please log in.')
        return
      }

      const user = JSON.parse(storedUser)
      const userId = user.id;
      
      try {
        const customCars = await customCaract.getCustomCarByUserId(userId);
        setUserCustomCar(customCars);
      } catch (error) {
        console.error('Error fetching user custom cars:', error);
        setErrorMessage('Failed to fetch your custom cars. Please try again later.');
      }
    }
    fetchUserCustomCar();

}, []);



 const toggleDetails = (id) => {
    setExpandedCarIds(prev =>
      prev.includes(id) ? prev.filter(carId => carId !== id) : [...prev, id]
    );
  };


 const handleCustomCar = () => {
  setIsListVisible(false);
  setIsCustomCarVisible(true);

}

const closeCustomCar = () => {
  setIsCustomCarVisible(false);
  setIsListVisible(true);


} 
  return (
    <div className={style.customCarContainer}>
 <div  className={style.customCarHomeHeader}>
  {onClose && <button className={style.closebutton} 
  onClick={onClose}>&#8592;</button>}
      <h2>Your Custom Cars</h2>
      </div>
            {errorMessage &&
            <p className={style.error}>{errorMessage}</p>}

      {userCustomCar.length > 0 && isListVisible ? (
        <>
      <button
      className={style.customCarButton2}
      onClick={handleCustomCar}>Customize Your Car</button>

        <div className={style.customCarList}>
          {userCustomCar.map(car => (
          <div key={car.id} className={style.customCarItem}>
            
              <h3 onClick={() => toggleDetails(car.id)} 
                className={style.customCarTitle}>
                {car.model || car.brand ? (
                  <>
                    {car.model ? `${car.model}` : `${car.brand}`}
                  </>
                ) : (
                  `${car.createdAt}`
                )}
          </h3>
          

              {expandedCarIds.includes(car.id) && (
            <div className={style.customCarDetails}>
                {car.brand ? (<p>Brand: {car.brand}</p>) : null}
                {car.model ? (<p>Model: {car.model}</p>) : null}
                {car.year ? (<p>Year: {car.year}</p>) : null}
                {car.price ? (<p>Price: {car.price}</p>) : null}
                {car.madeIn ? (<p>Made In: {car.madeIn}</p>) : null}
                {car.mileage ? (<p>Mileage: {car.mileage}</p>) : null}
                {car.fuelType ? (<p>Fuel Type: {car.fuelType}</p>) : null}
                {car.transmission ? (<p>Transmission: {car.transmission}</p>) : null}
                {car.bodyType ? (<p>Body Type: {car.bodyType}</p>) : null}
                {car.color ? (<p>Color: {car.color}</p>) : null}
                {car.seats ? (<p>Seats: {car.seats}</p>) : null}
                {car.doors ? (<p>Doors: {car.doors}</p>) : null}
                {car.engineSize ? (<p>Engine Size: {car.engineSize}</p>) : null}
                {car.status ? (<p>Status: {car.status}</p>) : null}
                {car.condition ? (<p>Condition: {car.condition}</p>) : null}
                {car.createdAt ? (<p>Created At: {car.createdAt}</p>) : null}
                {car.otherDescription ? (<p>Other Description: {car.otherDescription}</p>) : null}
                </div>
            )}


            </div>
          ))}
        </div>
</>
      ) : (
        isListVisible ? ( 
          <div>No history cars found.  <button
      className={style.customCarButton2} 
      onClick={handleCustomCar}>Customize Your Car</button>
      
      <div className={style.instruction}>
              <p className={style.instructionText}><em>Road King Motor</em>, we care about you, here you can customise your car as you want. </p>
      <p  className={style.instructionText}><button
      onClick={handleCustomCar}>Click </button> 
        above button to customize your car. There is no need to fill or to select all field, 
        you can  fill or select what you want only, and leave others. </p>
      <p  className={style.instructionText}>After you <strong>submit</strong> your custom car, we will contact you as soon as possible.</p>
      <p  className={style.instructionText}>You can also see your history custom cars here.</p>

     </div>
     </div>


        ) : (
          <p></p>

        )
      )
    }


          {isCustomCarVisible && (
            <div className={style.customCarContainer}>
              <CustomCar onClose={closeCustomCar}/>
            </div>
          )}




      </div>
  )
}

export default CustomCarHome;