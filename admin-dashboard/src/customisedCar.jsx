import customCarAct from './axios/customisedCar.js'
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import userAct from './userAxios.js'
import style from './module/customisedCarStyle.module.css'

const CustomisedCar = ({ onClose }) => {
  const [customCars, setCustomCars] = useState([])
  const [tracks, setTracks] = useState([])
  const [error, setError] = useState(null)
  const [selectedCar, setSelectedCar] = useState(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)

  const ADMIN_USERNAME = 'Road King Motor Support'
  const token = 'admin'
  const userName = 'Road King Motor Support'

  const processUserObject = (userObj) => {
    if (userObj && typeof userObj === 'object' && typeof userObj.id !=='undefined' && typeof userObj._id === 'undefined') {
      return {...userObj, _id: userObj.id }
    }
    return userObj;
  }

  // ✅ fetch admin + setup socket in one effect
  useEffect(() => {
    const setup = async () => {
      try {
        // fetch admin user
        const rawAdmin = await userAct.getUserByUserName(ADMIN_USERNAME)
        if (!rawAdmin || !rawAdmin.id) {
          setError(`Admin user "${ADMIN_USERNAME}" not found.`)
          console.error('Admin user not found:', rawAdmin)
          return
        }

        // setup socket with admin credentials
        const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const socket = io(socketUrl, {
          auth: {
            token,
            userId: rawAdmin.id,
            userName,
          },
        })

        socket.on('connect', () => {
          console.log('CustomisedCar socket connected')
          setIsSocketConnected(true)
        })

        socket.on('disconnect', () => {
          console.log('CustomisedCar socket disconnected')
          setIsSocketConnected(false)
        })

        socket.on('newCustomCar', newCustomCar => {
          setCustomCars(prevNewCustomCar => {
            let processedNewCustomCar = newCustomCar;
            if (newCustomCar && newCustomCar.user){
              processedNewCustomCar = {
                ...newCustomCar,
              user: processUserObject(newCustomCar.user),
              };
            }
            return [...prevNewCustomCar, processedNewCustomCar]
          });
        });

        socket.on('updateCustomCar', updatedCar => {
          setCustomCars(prevCars =>
            prevCars.map(car => (car._id === updatedCar._id ? updatedCar : car))
          )
          if (selectedCar && selectedCar._id === updatedCar._id) {
            setSelectedCar(updatedCar)
          }
        })

        return () => {
          socket.off('newCustomCar')
          socket.off('updateCustomCar')
          socket.disconnect()
        }
      } catch (err) {
        console.error('Error setting up admin + socket:', err)
        setError('Failed to setup admin socket.')
      }
    }

    setup()
  }, [selectedCar])

  // ✅ fetch cars separately (keep this effect clean)
  useEffect(() => {
    customCarAct
      .getCustomCar()
      .then(initialCustomCar => {        
        const processedCustomCars = initialCustomCar.map(car => ({
          ...car,
          user: processUserObject(car.user),
        }));

        setCustomCars(processedCustomCars);
        setTracks(initialCustomCar.tracks);        })
      .catch(error => {
        console.error('Error fetching customised car requests:', error)
        setError(error)
      })
  }, [])

  const handleUserClick = car => {
    setSelectedCar(car)
  }

  const updateCarTracks = async (id, tracks) => {
    try {
      const updatedCar = await customCarAct.updateCustomCar(id, tracks, token)
      setCustomCars(customCars.map(car => (car.id === id ? updatedCar : car)))
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
      <p>Socket status: {isSocketConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>

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
