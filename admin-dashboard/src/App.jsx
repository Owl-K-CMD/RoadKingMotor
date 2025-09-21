import React, { useEffect, useState, useRef } from 'react'
import motoractadmin from './carsAdmin.js'
import userAct from './userAxios.js'
import Newcar from './newcar.jsx'
import style from './module/style.module.css'
import Message from './message.jsx'
import AuthForm from './authForm.jsx'
import Comments from './comment.jsx'
import io from 'socket.io-client';
import CustomisedCar from './customisedCar.jsx'


const Notification = ({ message, className }) => {
  if (message === null) {
    return null;
  }
  return (< div className = { className || "error"}>
    {message}
  </div> 
)
}

const App = () => {

  const [cars, setCars] = useState([])
  const [errorMessage, SetErrorMessage] = useState(null)
  const [showNewCarForm, setShowNewCarForm] = useState(false)
  const [isChatVisible, setIsChatVisible] = useState(false)
  const [showTable, setShowTable] = useState(false);
  const [chatTargetCar, setChatTargetCar] = useState(null)
  const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [isCustomCarVisible, setIsCustomCarVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [selectedCarId, setSelectedCarId] = useState(null)
  const socket = useRef(null);
  const [unReadMessageCount, setUnReadMessageCount] = useState(0)
  const [unReadCustomCarCount, setUnReadCustomCarCount] = useState(0)
  const [customCars, setCustomCars] = useState([]);

  const [messages, setMessages] = useState([]);
  const userId = adminUser?.id;
  const ADMIN_USERNAME = 'Road King Motor Support'

  const processUserObject = (userObj) => {
    if (userObj && typeof userObj === 'object' && typeof userObj.id !=='undefined' && typeof userObj._id === 'undefined') {
      return {...userObj, _id: userObj.id }
    }
    return userObj;
  }
  
  useEffect(() => {
    let isMountedAdminFetch = true;
  
    const fetchAdminDetails = async () => {
      try {
        const rawAdmin = await userAct.getUserByUserName(ADMIN_USERNAME)
        const admin = processUserObject(rawAdmin);
        console.log('Message Admin:', admin)
        if (isMountedAdminFetch) {
          if (admin && admin._id) {
            setAdminUser(admin);
          }
        }
      } catch (err) {
        console.error("Error fetching admin user details:", err);
    };
  }

  fetchAdminDetails();
  
  return () => {
    isMountedAdminFetch = false;
  };
  }, []);
  

  useEffect(() => {
    motoractadmin.getAll()
      .then(initialCars => {
        console.log('Data received from getAll:', initialCars);
        if (Array.isArray(initialCars)) {
          setCars(initialCars);
          console.log('Cars state succesfully');
          } else {
            console.error("Error: Data received from server is not array!", initialCars)
        setCars([])
      alert("Could not load data correctly.")
    }})
      .catch(error => {
      console.error("Error fetching data:", error);
      })
    }, []);

    useEffect(() => {
      const token = 'admin'
      const userName = 'Road King Motor Support';

      const socketUrl= import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

      socket.current = io(socketUrl, {
        auth: {
        userName: userName,
        token: token,
        userId: adminUser?._id
        },
        transports: ['websocket'],
          withCredentials: true,
      });

      socket.current.on('connect', () => {
        console.log('Socket connected in App.jsx', userId)
      })

      socket.current.on('receiveMessage', (data) => { 
        console.log("receiveNessage event trigered:", data)
        setMessages(prevMessages => {
          const processedMessage = {
          ...data,
          sender: processUserObject(data.sender),
          receiver: processUserObject(data.receiver),
        };
          return [...prevMessages, processedMessage]
        });
        setUnReadMessageCount(prevCount => prevCount + 1);
      });

  socket.current.on('newCustomCar', newCustomCar => {
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
    setUnReadCustomCarCount(prevCount => prevCount + 1);
    });

  //socket.current.on('updateCustomCar', async (updatedCustomCar) => {
    //logger.info(`Received updateCustomCar event: ${JSON.stringify(updatedCustomCar)}`)

  //}
    //)

  socket.current.on('disconnect', () => {
        console.log('Socket disconnected in App.jsx')
      })
      return () => {
        if (socket.current) {
          socket.current.off('connect')
          socket.current.off('receiveMessage');
          socket.current.off('disconnect');
          socket.current.disconnect();
        }
      }
      
    }, [currentUser, adminUser?._id, userId])

  const toggleNewCarForm = () => {
  setShowNewCarForm(!showNewCarForm);
  };

const handleDelete = (id) => {
  const car = cars.find(p => p.id === id);
  console.log('car find first:', car)
  if (!car) {
    console.error(`Car with ID ${id} not found.`);
    console.log('car return :', car);
    return;
  }
  const confirmDelete = window.confirm(`Delete ${car.model} ${car.id}?`);
  if (confirmDelete) {
    motoractadmin
      .deleteMotor(id)
      .then(() => {
        setCars(cars.filter(p => p.id !== id));
      })
      .catch(error => {
        console.error("Error deleting car:", error);
        SetErrorMessage(
          `Information of ${car.model} has already been removed from server`
        );
        setTimeout(() => {
          SetErrorMessage(null)
        }, 10000)
        setCars(cars.filter(n => n.id !== id))
      })
  }
  }

  const handleOpenChat = (car) => {
  setChatTargetCar(car);
  setIsChatVisible(true);

};

const handleCloseChat = () => {
  setIsChatVisible(false);
  setChatTargetCar(null)
  setUnReadMessageCount(0);
}
 
const handleToggleLoginVisibility = () => {
  setIsLoginVisible(prev => !prev);
}

const handleToggleCustomCarVisibility = () => {
  setIsCustomCarVisible(prev => !prev);
  setUnReadCustomCarCount(0);
}


const handleLoginSuccess = (userData) => {
  setCurrentUser(userData);
  //initSocket(userData.id, localStorage.getItem('authToken'));
  setIsLoginVisible(false);
  }



const handleLogout = () => {
  console.log("Executing handleLogout: Clearing session.");
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('refreshToken');
}
return (
    <div>
<h1 className={style.title}>Road king motor admin dashboard </h1>

<div className={style.navbar}>
<button className={style.chatbutton} onClick={() => handleOpenChat(cars)}>
Message
{unReadMessageCount > 0 && (
  <span className={style.notificationBadge}>
    {unReadMessageCount}
  </span>
)}
  </button>

{currentUser ? (
        <>
          <span className={style.welcomeMessage}>{currentUser.userName}!</span>
          <button onClick={handleLogout} className={style.navbuttonmyaccount}>Logout</button>
        </>
      ) : (
        <button className= {style.navbuttonmyaccount} onClick={handleToggleLoginVisibility}>
          My Account
        </button>
      )}
      {isLoginVisible && !currentUser && (
        <div className={style.authFormContainer}>
                  <button onClick={handleToggleLoginVisibility}
                  className={style.closebutton}
              style={{ marginTop: '10px' }}>
                Close
              </button>
                      <AuthForm onLoginSuccess={handleLoginSuccess}
                      onClose={handleToggleLoginVisibility}
                      />
            </div>
      )
        }
<button>Users</button>
<button>brands</button>
<button>Models</button>
<button onClick={handleToggleCustomCarVisibility}>Custom Car

{unReadCustomCarCount > 0 && (
  <span className={style.notificationBadge}>
    {unReadCustomCarCount}
  </span>
)}</button>
<button>Add To Cart</button>
<button>Statistics</button>

</div>
{isChatVisible && chatTargetCar && (
      <div className={style.message}
      onClick={() => {
      console.log('clearing message count')
      setUnReadMessageCount(0)
      }}>
        < Message targetName={`Seller for  ${chatTargetCar.model}`} 
        onClose={handleCloseChat} messages = {messages} setMessages = {setMessages}
        unReadMessageCount={unReadMessageCount} setUnReadMessageCount={setUnReadMessageCount}
        />
      </div>
    )}
    {selectedCarId && <Comments carId={selectedCarId} />}

  <Notification message = {errorMessage} className={style.error}/>

<button className={style.button} onClick={() => setShowTable(!showTable)}>
        {showTable ? 'Hide Cars Table' : 'Show Cars Table'}
      </button>

      <button onClick = {toggleNewCarForm }
 className={style.button}>

  {showNewCarForm ? 'Cancel Adding Newcar' : 'Add new car'}
 </button>

{showTable && (

<table className={style.table} >
  <thead className={style.thead}>
    <tr>
      <th >Image</th>
      <th >brand</th>
      <th >Model</th>
      <th >Price</th>
      <th >Year</th>
      <th >Made in</th>
      <th >Mileage</th>
      <th >Fuel type</th>
      <th >Transmission</th>
      <th >Body Type</th>
      <th >Color</th>
      <th >Seats</th>
      <th >Doors</th>
      <th >Engine size</th>
      <th >Status</th>
      <th>Condition</th>
      <th >Created at</th>
      <th >Other details</th>
      <th >Modify</th>
    </tr>
  </thead>
  <tbody>
    {cars.length > 0 ? (
      cars.map(car => (        
        <tr key={car._id || Math.random()}
        className={style.tableBody}>

          <td>
            {car.images && Array.isArray(car.images) && car.images.length > 0 ?(
              <img className={style.tableImage}
                src={car.images[0]}
                alt={`${car.model} 1`}
              />
            
          ) : car.images && typeof car.images === 'string' ? (
                          <img
                src={car.images}
                alt={car.model}
                style={{
                  width: '100px',
                  height: 'auto',
                  objectFit: 'cover',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',
                  margin: '0 auto'
                }} />
      ) : (
    <img src="https://via.placeholder.com/100x67.png?text=No+Image" 
                alt="No image available" 
                style={{
                  width: '100px',
                  height: 'auto', 
                  display: 'block',
                  margin: '0 auto'
                }} 
              />
            )}
          </td>
          <td >{car.brand}</td>
          <td >{car.model}</td>
          <td >{car.price} $</td>
          <td >{car.year}</td>
          <td >{car.madeIn}</td>
          <td >{car.mileage} km</td>
          <td >{car.fuelType}</td>
          <td >{car.transmission}</td>
          <td >{car.bodyType}</td>
          <td >{car.color}</td>
          <td >{car.seats}</td>
          <td >{car.doors}</td>
          <td >{car.engineSize}</td>
          <td >{car.status}</td>
          <td>{car.condition}</td>
          <td >{car.createdAt}</td>
          <td >{car.otherDescription}</td>
          <td>
            <div className={style.modify}>
            <button className={style.buttonModify} id = {car.id}
            onClick={() => handleDelete(car.id)} > Delete </button>
          <button className={style.buttonModify}>Edit</button>
          <button className={style.buttonModify} onClick={() => {
            setSelectedCarId(car.id)
          }}>Comments</button>
          </div>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td>
          No car here
        </td>
      </tr>
    )}
  </tbody>
</table>
)}
{isCustomCarVisible && <CustomisedCar 
onClose={handleToggleCustomCarVisibility}
  customCars = {customCars} setCustomCars = {setCustomCars}
  unReadCustomCarCount={unReadCustomCarCount} 
  setUnReadCustomCarCount={setUnReadCustomCarCount}/>}
{showNewCarForm && <Newcar />}
  </div>
  )
}
export default App