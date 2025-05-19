
import { useState, useEffect } from 'react'
import motoract from './cars'




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

    <div>
     
     {filtercar.length > 0 ? (
  filtercar.map(car => (
    <div key={car._id} style = {{border: '1px solid black', height:'30px'}} >{car.image && <img src = {car.image} alt={car.name}
     style={{maxWidth: '200px', maxHeight: '200px', display: 'block', margin: '0 auto'}}/>} /br {car.name} /br
    {car.price}  /br {car.currency} /br {car.dateOfRelease} /br {cars.description}
    id={car.id}  </div>))
  ) : (
    <div>No car here</div>
  )
 }

    </div>

  </div>
  )
}

export default App