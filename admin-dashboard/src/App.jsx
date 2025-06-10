import { useEffect, useState } from 'react'
import motoractadmin from './carsAdmin.js'
import Newcar from './newcar.jsx'
import style from './style.module.css'
import Button from './button.jsx'
import Message from './message.jsx'


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
        //alert("Error fetching data. Please try again later.");
      })
    }, []);
  const toggleNewCarForm = () => {
    setShowNewCarForm(!showNewCarForm);
  };

const handleDelete = (id) => {
  const car = cars.find(p => p._id === id);
  console.log('car find first:', car)
  if (!car) {
    console.error(`Car with ID ${id} not found.`);
    console.log('car return :', car);
    return;
  }
  const confirmDelete = window.confirm(`Delete ${car.model}?`);
  if (confirmDelete) {
    motoractadmin
      .deleteMotor(id)
      .then(() => {
        setCars(cars.filter(p => p._id !== id));
        
      })
    
    
      .catch(error => {
        console.error("Error deleting car:", error);
        SetErrorMessage(
          `Information of ${car.model} has already been removed from server`
        );
        setTimeout(() => {
          SetErrorMessage(null)
        }, 10000)
        setCars(cars.filter(n => n._id !== id))
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
 
  return (
    <div>
      <div className="flex items-center justify-center">
<h1 className="text-4xl font-extrabold text-center my-8 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">Road king motor admin dashboard </h1>
<button className={style.chatbutton} onClick={() => handleOpenChat(cars)}>
  <img className={style.chat}
   src= "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-48.png"
  alt = "chat"/>

  </button>
</div>
{isChatVisible && chatTargetCar && (
      <div style={{position: 'fixed', overflowY: 'auto', bottom: '20px',  right: '20px',
        width: '350px',   maxHeight: '100%',   backgroundColor: 'white',   border: '1px solid #ccc',
        borderRadius: '8px',  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',   zIndex: 1000,
        display: 'flex',  flexDirection: 'column',     padding: '15px'
      }}>
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
    </tr>
  </thead>
  <tbody>
    {cars.length > 0 ? (
      cars.map(car => (        
        <tr key={car._id || Math.random()}
        className="dark:border-gray-700 odd:bg-green-100 even:bg-blue-50 dark:odd:bg-green-400/50 dark:even:bg-blue-800/20 hover:bg-gray-200 dark:hover:bg-gray-700">

          <td className="py-4 px-6">
            {car.images && (
              <img  
                src={car.images}
                alt={car.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            )}
          </td>
          <td >{car.brand}</td>
          <td >{car.model}</td>
          <td >{car.price} rwf</td>
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
          <td >{car.otherDetails}</td>
          <td><button
           className={style.buttonsvg}>
          <img className={style.svg}
           src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-edit-50.png"/> </button></td>
          <td><Button className={style.buttonsvg} id = {car._id} handleDelete ={handleDelete}
            
          /></td>
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