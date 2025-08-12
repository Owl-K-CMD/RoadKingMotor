import { useEffect, useState } from 'react'
import motoractadmin from './carsAdmin.js'
import Newcar from './newcar.jsx'
import style from './module/style.module.css'
//import Button from './button.jsx'
import Message from './message.jsx'
import AuthForm from './authForm.jsx'
import Comments from './comment.jsx'


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
  const [showComments, setShowComments] = useState(false);
  const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedCarId, setSelectedCarId] = useState(null)


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
           }
      })

      .catch(error => {
       console.error("Error fetching data:", error);
      })
    }, []);
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
}
 
const handleToggleLoginVisibility = () => {
  setIsLoginVisible(prev => !prev);
}

const handleLoginSuccess = (userData) => {
  setCurrentUser(userData);
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
<button>Orders</button>
<button>Add To Cart</button>
<button>Statistics</button>

</div>
{isChatVisible && chatTargetCar && (
      <div className={style.message}>
        < Message targetName={`Seller for  ${chatTargetCar.model}`} onClose={handleCloseChat} />
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
                       <img 
                src="https://via.placeholder.com/100x67.png?text=No+Image" 
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


{showNewCarForm && <Newcar />}

    </div>

  )
}
export default App