
import { useState, useEffect } from 'react'
import motoract from './cars'
import style from './module/style.module.css'




const App = () => {

  const [cars, setCars] = useState([])
  const [showAll, setShowAll] = useState('')




   useEffect(() => {
    motoract.getAll()
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

    const filtercar = cars.filter(car => car.name.toLowerCase().includes(showAll.toLowerCase()));

  return (
  <div>
    <div >ROAD KING MOTOR</div>
    <img src= "https://roadkingmoor.s3.eu-north-1.amazonaws.com/amarula2.jpeg"/>

    <div className={style.filter}>
     
     {filtercar.length > 0 ? (
  filtercar.map(car => (
    <div key={car._id} className={style.carproparty} >
        <p>{car.image && <img src = {car.image} alt={car.name}
     style={{maxWidth: '200px', maxHeight: '200px', display: 'block', margin: '0 auto'}}/>} </p>
     <p>{car.name} </p>
    <p>{car.price}  </p> 
    <p> {car.currency}</p> 
    <p>{car.dateOfRelease} </p>
    <p> {car.description}</p>
    
    
 </div>))
  ) : (
    <div>No car here</div>
  )
 }

    </div>

  </div>
  )
}

export default App