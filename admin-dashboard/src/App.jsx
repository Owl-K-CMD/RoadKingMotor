import { useEffect, useState } from 'react'
import motoractadmin from './carsAdmin.js'
import Newcar from './newcar.jsx'
import style from './style.module.css'


const App = () => {

  const [cars, setCars] = useState([])

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

    const DisplayCars = () => {

    }



    const updateCars = () => {

    }

    const deleteCars = () => {

    }

    const filtercar = cars.filter(car => car.name.toLowerCase())
  return (
    <div>
<h1>Road king motor admin dashboard </h1>
<table>
  <thead>
    <tr>
      <th>Image</th>
      <th>Name</th>
      <th>Price</th>
      <th>Currency</th>
      <th>Date of Release</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    {filtercar.length > 0 ? (
      filtercar.map(car => (
        <tr key={car._id} className={style.carproparty}>
          <td>
            {car.image && (
              <img
                src={car.image}
                alt={car.name}
                style={{
                  maxWidth: '50px',
                  maxHeight: '50px',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            )}
          </td>
          <td>{car.name}</td>
          <td>{car.price}rwf</td>
          <td>{car.currency}</td>
          <td>{car.dateOfRelease}</td>
          <td>{car.description}</td>
          <td><button className={style.buttonsvg}><img className={style.svg} src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-edit-50.png"/></button></td>
          <td><button className={style.buttonsvg}><img className={style.svg} src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-delete-30.png"/></button></td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="6" style={{ textAlign: 'center' }}>
          No car here
        </td>
      </tr>
    )}
  </tbody>
</table>
<button className={style.buttonaddnewcar}>Add new car</button>
<Newcar />
    </div>
  )
}
export default App