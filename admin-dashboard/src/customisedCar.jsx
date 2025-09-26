import customCarAct from './axios/customisedCar.js'
import { useState, useEffect } from 'react'
import style from './module/customisedCarStyle.module.css'

const CustomisedCar = ({ onClose, customCars, setCustomCars }) => {

  const [error, setError] = useState(null)
  const [selectedCar, setSelectedCar] = useState(null)

  const processUserObject = (userObj) => {
    if (userObj && typeof userObj === 'object' && typeof userObj.id !=='undefined' && typeof userObj._id === 'undefined') {
      return {...userObj, _id: userObj.id }
    }
    return userObj;
  }

  useEffect(() => {
    customCarAct
      .getCustomCar()
      .then(initialCustomCar => {        
        const processedCustomCars = initialCustomCar.map(car => ({
          ...car,
          user: processUserObject(car.user),
        }));

        setCustomCars(processedCustomCars);
  })
  .catch(error => {
  console.error('Error fetching customised car requests:', error)
  setError(error)
  })
  }, [setCustomCars])

  const handleUserClick = car => {
    setSelectedCar(car)
  }

  const updateCarTracks = async (id, tracks) => {
    try {
      const updatedCar = await customCarAct.updateCustomCar(id, tracks)
      setCustomCars(prevCars => {
        return prevCars.map(car => (car.id === id ? { ...car, tracks: tracks } : car));
      });
      if (selectedCar && selectedCar.id === id) {
        setSelectedCar({ ...selectedCar, tracks: updatedCar.tracks })
      }
    } catch (error) {
      console.error('Error updating car tracks:', error)
      setError(error)
    }
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        {onClose && (
          <button className={style.closebutton} onClick={onClose}>
            &#8592;
          </button>
        )}
        <span className={style.title}>Customised Car Requests</span>
      </div>

      {error && <div className={style.error}>Error: {error.message}</div>}

      <div className={style.contentwrapper}>
        <div className={style.contentLeft}>
          <div className={style.userList}>
            {customCars.map(car => {
  let displayName = "Unknown User";
  if (car.user) {
    displayName = typeof car.user === "object"
    ? (car.user.userName || `User (${car.user._id?.slice(0,6)})`)
    : car.user;
  }
  return (
    <div key={car.id || car._id} className={style.card}>
      <button
        className={style.userButton}
        onClick={() => handleUserClick(car)}
      >
        {displayName}
      </button>
    </div>
  )
})}

          </div>
        </div>

        <div className={style.contentRight}>
          {selectedCar && (
            <div className={style.detailCard}>
              <div className={style.card}>
                <p>Sender: {selectedCar.user}</p>
                <p>Brand: {selectedCar.brand}</p>
                <p>Car Model: {selectedCar.model}</p>
                <p>Year: {selectedCar.year}</p>
                <p>Transmission: {selectedCar.transmission}</p>
                <p>Color: {selectedCar.color}</p>

                <select
                  value={selectedCar.tracks}
                  onChange={e => updateCarTracks(selectedCar.id, e.target.value)}
                >
                  <option value="Received">Received</option>
                  <option value="Proceeding">Proceeding</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomisedCar
