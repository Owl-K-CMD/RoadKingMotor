
import { useState, useEffect } from 'react'
import motoract from './cars'
import style from './module/style.module.css'
//import { useNavigate } from 'react-router-dom'
import Brand from './brand'





const App = () => {

  const [cars, setCars] = useState([])
  const [showAll, setShowAll] = useState('')
  //const [name, setName] = useState('')
 // const navigate = useNavigate()



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



    const filtercar = cars.filter(car => (car.brand || '').toLowerCase().includes(showAll.toLowerCase()));
    const uniqueCarNames = [...new Set(cars.map(car => car.brand).filter(brand => brand))];


  return (
  <div>
    <div className={style.title}>ROAD KING MOTOR</div>
    <img src= "https://roadkingmoor.s3.eu-north-1.amazonaws.com/amarula2.jpeg"/>
    
 
 <div className={style.search}>
  <button
  className= {style.newbutton}
  onClick = {() => setShowAll('')}
  >
  Show All cars
  </button>

</div>

{uniqueCarNames.map((brand) => (
      <button key = {brand}
      className= {style.navbutton}
      onClick = {() => setShowAll(brand)}>
        {brand}
      </button>
    
        ))}
    <div className={style.filter}>
     
     {filtercar.length > 0 ? (
  filtercar.map(car => (
    <div key={car._id} className={style.carproparty} >
        <p>{car.images && <img src = {car.images} alt={car.model}
     style={{maxWidth: '200px', maxHeight: '200px', display: 'block', margin: '0 auto'}}/>}
      </p>
     <p>{car.brand} </p>
     <p>{car.model} </p>
    <p>{car.price}  rwf</p> 
    <p>{car.year} </p>
    <p>{car.madeIn}</p>
    <p>{car.mileage}</p>
    <p>{car.fuelType}</p>
    <p>{car.bodyType}</p>
    <p>{car.transmission}</p>
    <p>{car.color}</p>
    <p>{car.seats}</p>
    <p>{car.doors}</p>
    <p>{car.engineSize}</p>
    <p>{car.status}</p>
    <p>{car.createdAt}</p>
    <p>{car.otherDescription}</p>
    
 </div>))
  ) : (
    <div>No car here</div>
  )
 }

<Brand />

    </div>

  </div>
  )
}

export default App