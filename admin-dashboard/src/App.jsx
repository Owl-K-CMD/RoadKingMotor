import { useEffect, useState } from 'react'
import motoractadmin from './carsAdmin.js'
import Newcar from './newcar.jsx'
import style from './module/style.module.css'
import Button from './button.jsx'
import Message from './message.jsx'
import AuthForm from './authForm.jsx'


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
   const [chatTargetCar, setChatTargetCar] = useState(null)
   const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)



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
      <div className="flex items-center justify-center">
<h1 className="text-4xl font-extrabold text-center my-8 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Road king motor admin dashboard </h1>
<button className={style.chatbutton} onClick={() => handleOpenChat(cars)}>
  <img className={style.chat}
   src= "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-48.png"
  alt = "chat"/>

  </button>

{currentUser ? (
        <>
          <span className={style.welcomeMessage}>{currentUser.userName}!</span>
          <button onClick={handleLogout} className={style.navbuttonmyaccount}>Logout</button>
        </>
      ) : (
        <button className= {style.navbuttonmyaccount} onClick={handleToggleLoginVisibility}>
          <img className={style.myaccount} src = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-my-account-50.png"
            alt = "myaccount" />
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

</div>
{isChatVisible && chatTargetCar && (
      <div className={style.message}>
        < Message targetName={`Seller for  ${chatTargetCar.model}`} onClose={handleCloseChat} />
      </div>
    )}


 <Notification message = {errorMessage} className={style.error}/>


<table className=" text-sm text-left text-gray-500 dark:text-gray-400" >
  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
    <tr>
      <th scope="col" className="py-3 px-2">Image</th>
      <th scope="col" className="py-3 px-2">brand</th>
      <th scope="col" className="py-3 px-2">Model</th>
      <th scope="col" className="py-3 px-2">Price</th>
      <th scope="col" className="py-3 px-2">Year</th>
      <th scope="col" className="py-3 px-2">Made in</th>
      <th scope="col" className="py-3 px-2">Mileage</th>
      <th scope="col" className="py-3 px-2">Fuel type</th>
      <th scope="col" className="py-3 px-2">Transmission</th>
      <th scope="col" className="py-3 px-2">Body Type</th>
      <th scope="col" className="py-3 px-2">Color</th>
      <th scope="col" className="py-3 px-2">Seats</th>
      <th scope="col" className="py-3 px-2">Doors</th>
      <th scope="col" className="py-3 px-2">Engine size</th>
      <th scope="col" className="py-3 px-2">Status</th>
      <th scope="col" className="py-3 px-2">Created at</th>
      <th scope="col" className="py-3 px-2">Other details</th>
      <th scope="col" className="py-3 px-2">Modify</th>
    </tr>
  </thead>
  <tbody>
    {cars.length > 0 ? (
      cars.map(car => (        
        <tr key={car._id || Math.random()}
        className="dark:border-gray-700 odd:bg-green-100 even:bg-blue-50 dark:odd:bg-green-400/50 dark:even:bg-blue-800/20 hover:bg-gray-200 dark:hover:bg-gray-700">

          <td className="py-4 px-4">
            {car.images && Array.isArray(car.images) && car.images.length > 0 ?(
              <img  
                src={car.images[0]}
                alt={`${car.model} 1`}
                style={{
                  width: '50px',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  margin: '0 auto'
                }}
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
          <td >{car.createdAt}</td>
          <td >{car.otherDescription}</td>
          
           <td><Button className={style.buttonsvg} id = {car.id} handleDelete ={handleDelete} />
          </td>
          <td>  <button
           className={style.buttonsvg}>
          <img className={style.svg}
           src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-edit-50.png"/> </button></td>
         
        </tr>
      ))
    ) : (
      <tr  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
        <td  colSpan="18" style={{ textAlign: 'center' }}>
          No car here
        </td>
      </tr>
    )}
  </tbody>
</table>

<button onClick = {toggleNewCarForm }
 className="mt-6 mb-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition ease-in-out duration-150"
 >
  {showNewCarForm ? 'Cancel' : 'Add new car'}
 </button>
{showNewCarForm && <Newcar />}
    </div>
  )
}
export default App