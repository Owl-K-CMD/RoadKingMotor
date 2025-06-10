import { useState } from 'react'
import motoractadmin from './carsAdmin.js'
import style from './style.module.css'

const Newcar = () => {
  
  const [newCar, setNewCar] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [newImage, setNewImage] = useState('')
  const [newBrand, setNewBrand] = useState('')
  const [newModel, setNewModel] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newMadeIn, setNewMadeIn] = useState('')
  const [newMileage, setNewMileage] = useState('')
  const [newFuelType, setNewFuelType] = useState('')
  const [newTransmission, setNewTransmission] = useState('')
  const [newBodyType, setNewBodyType] = useState('')
  const [newColor, setNewColor] = useState('')
  const [newSeats, setNewSeats] = useState('')
  const [newDoors, setNewDoors] = useState('')
  const [newEngineSize, setNewEngineSize] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [newCreatedAt, setNewCreatedAt] = useState('')
  const [newOtherDetails, setNewOtherDetails] = useState('')
  

const addCar = (e) => {
  e.preventDefault();

  const newCarObject = {
    image: newImage,
    brand: newBrand,
    model: newModel,
    price: newPrice,
    year: newYear,
    madeIn: newMadeIn,
    mileage: newMileage,
    fuelType: newFuelType,
    transmission: newTransmission,
    bodyType: newBodyType,
    color: newColor,
    seats: newSeats,
    doors: newDoors,
    engineSize: newEngineSize,
    status: newStatus,
    createdAt: newCreatedAt,
    otherDetails: newOtherDetails,
      }

const formData = new FormData();
formData.append('image', newImage);
formData.append('brand', newBrand);
formData.append('model', newModel);
formData.append('price', newPrice);
formData.append('year', newYear);
formData.append('madeIn', newMadeIn);
formData.append('mileage', newMileage);
formData.append('fuelType', newFuelType);
formData.append('transmission', newTransmission);
formData.append('bodyType', newBodyType);
formData.append('color', newColor);
formData.append('seats', newSeats);
formData.append('doors', newDoors);
formData.append('engineSize', newEngineSize);
formData.append('status', newStatus);
formData.append('createdAt', newCreatedAt);
formData.append('otherDetails', newOtherDetails);




  motoractadmin
  .create(newCarObject)
  //.create(formData)
  .then(response => {
    setNewCar(newCar.concat(response));
    setNewImage('');
    setNewBrand('');
    setNewModel('');
    setNewPrice('');
    setNewYear('');
    setNewMadeIn('');
    setNewMileage('');
    setNewFuelType('');
    setNewTransmission('');
    setNewBodyType('');
    setNewColor('');
    setNewSeats('');
    setNewDoors('');
    setNewEngineSize('');
    setNewStatus('');
    setNewCreatedAt('');
    setNewOtherDetails('');

   if (document.getElementById('newCarImageInput')) {
      document.getElementById('newCarImageInput').value = '';
    }
  })
  
  .catch(error => {
    console.log(error.response.data.error)
    setErrorMessage(`Error: ${error.response?.data?.error || 'Unknown error'}`);
  })
  setTimeout(() => {setErrorMessage(null)}, 10000)

    }
const handleNewImage = (e) => {
     setNewImage(e.target.files[0]);
 
     if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
     } else {
      setNewImage(null)
     }
}

const handleNewBrand = (e) => {
setNewBrand(e.target.value);
}

const handleNewModel = (e) => {
setNewModel(e.target.value);
}


const handleNewPrice = (e) => {
setNewPrice(e.target.value);
}

const handleNewYear = (e) => {
setNewYear(e.target.value);
}

const handleNewMadeIn = (e) => {
setNewMadeIn(e.target.value);
}

const handleNewMileage = (e) => {
setNewMileage(e.target.value);
}

const handleNewFuelType = (e) => {
setNewFuelType(e.target.value);
}

const handleNewTransmission = (e) => {
setNewTransmission(e.target.value);
}

const handleNewBodyType = (e) => {
setNewBodyType(e.target.value);
}

const handleNewColor = (e) => {
setNewColor(e.target.value);
}

const handleNewSeats = (e) => {
setNewSeats(e.target.value);
}

const handleNewDoors = (e) => {
setNewDoors(e.target.value);
}

const handleNewEngineSize = (e) => {
setNewEngineSize(e.target.value);
}

const handleNewStatus = (e) => {
setNewStatus(e.target.value);
}

const handleNewCreatedAt = (e) => {
setNewCreatedAt(e.target.value);
}

const handleNewOtherDetails = (e) => {
setNewOtherDetails(e.target.value);
}


  return (
<div>
<form className={style.formnewcar} onSubmit= {addCar}>
<div className = {style.inputnewcar}>
 Images <input type="file" id="newCarImageInput"
  onChange= {handleNewImage} />
</div>

<div className = {style.inputnewcar}>
 Brand <input value= {newBrand}
  onChange= {handleNewBrand} />
</div>

<div className = {style.inputnewcar}>
 Model <input value= {newModel}
  onChange= {handleNewModel} />
</div>

<div className = {style.inputnewcar}>
 Price <input type="number" value= {newPrice}
  onChange= {handleNewPrice} />
</div>

<div className = {style.inputnewcar}>
 Year <input type="number" value= {newYear}
  onChange= {handleNewYear} />
</div>

<div className = {style.inputnewcar}>
 Made in <input value= {newMadeIn}
  onChange= {handleNewMadeIn} />
</div>

<div className = {style.inputnewcar}>
 Mileage <input type="number" value= {newMileage}
  onChange= {handleNewMileage} />
</div>

<div className = {style.inputnewcar}>
 Fuel type <input value= {newFuelType}
  onChange= {handleNewFuelType} />
</div>

<div className = {style.inputnewcar}>
 Transmission <input value= {newTransmission}
  onChange= {handleNewTransmission} />
</div>

<div className = {style.inputnewcar}>
 Body type <input value= {newBodyType}
  onChange= {handleNewBodyType} />
</div>

<div className = {style.inputnewcar}>
 Color <input value= {newColor}
  onChange= {handleNewColor} />
</div>

<div className = {style.inputnewcar}>
 Seats <input type="number" value= {newSeats}
  onChange= {handleNewSeats} />
</div>

<div className = {style.inputnewcar}>
 Doors <input type="number" value= {newDoors}
  onChange= {handleNewDoors} />
</div>

<div className = {style.inputnewcar}>
 Engine size <input type="number" value= {newEngineSize}
  onChange= {handleNewEngineSize} />
</div>

<div className = {style.inputnewcar}>
 Status <input value= {newStatus}
  onChange= {handleNewStatus} />
</div>

<div className = {style.inputnewcar}>
 Created at <input type="date" value= {newCreatedAt}
  onChange= {handleNewCreatedAt} />
</div>

<div className = {style.inputnewcar}>
 Other details <input value= {newOtherDetails}
  onChange= {handleNewOtherDetails} />
</div>


<button className = {style.formonsubmit}>Submit</button>
    

</form>
  </div>
  )
}

export default  Newcar