import { useState } from 'react'
import motoractadmin from './carsAdmin.js'
import style from './module/newCarStyle.module.css'

const Newcar = () => {
  
  const [newCar, setNewCar] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [newImages, setNewImages] = useState([])
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
  const [newCondition, setNewCondition] = useState('')
  const [newCreatedAt, setNewCreatedAt] = useState('')
  const [newOtherDescription, setNewOtherDescription] = useState('')
  

const addCar = (e) => {
  e.preventDefault();
const formData = new FormData();
if (newImages.length > 0) {
  newImages.forEach((imageFile) => {
    formData.append('images', imageFile)
  })
}
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
formData.append('condition', newCondition);
formData.append('createdAt', newCreatedAt);
formData.append('otherDescription', newOtherDescription);




  motoractadmin
  .create(formData)
  .then(response => {
    setNewCar(newCar.concat(response));
    setNewImages([]);
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
    setNewCondition('')
    setNewCreatedAt('');
    setNewOtherDescription('');

   if (document.getElementById('newCarImageInput')) {
      document.getElementById('newCarImageInput').value = null;
    }
  })
  
  .catch(error => {
    console.log(error.response.data.error)
    setErrorMessage(`Error: ${error.response?.data?.error || 'Unknown error'}`);
  })
  setTimeout(() => {setErrorMessage(null)}, 10000)

    }
const handleNewImage = (e) => {
 
     if (e.target.files && e.target.files.length > 0) {
      setNewImages(Array.from(e.target.files));
     } else {
      setNewImages([])
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

const handleNewOtherDescription = (e) => {
setNewOtherDescription(e.target.value);
}

const handleNewCondition = (e) => {
  setNewCondition(e.target.value)
}
  return (
<div className={style.newcar}>
<form className={style.formnewcar} onSubmit= {addCar}>
<div className = {style.inputnewcar}>
 Images <input type="file" id="newCarImageInput"
  multiple
  accept="image/*"
  onChange= {handleNewImage} />
  {newImages.length > 0 && <div className={style.inputValue}>Selected files: {newImages.map(f => f.name).join(', ')}</div>}
</div>

<div className = {style.inputnewcar}>
 Brand <input className={style.inputValue} value= {newBrand}
  onChange= {handleNewBrand} />
</div>

<div className = {style.inputnewcar}>
 Model <input className={style.inputValue} value= {newModel}
  onChange= {handleNewModel} />
</div>

<div className = {style.inputnewcar}>
 Price <input type="number" className={style.inputValue} value= {newPrice}
  onChange= {handleNewPrice} />
</div>

<div className = {style.inputnewcar}>
 Year <input type="number" className={style.inputValue} value= {newYear}
  onChange= {handleNewYear} />
</div>

<div className = {style.inputnewcar}>
 Made in <input className={style.inputValue} value= {newMadeIn}
  onChange= {handleNewMadeIn} />
</div>

<div className = {style.inputnewcar}>
 Mileage <input type="number" className={style.inputValue} value= {newMileage}
  onChange= {handleNewMileage} />
</div>

<div className = {style.inputnewcar}>
 Fuel type
<div className={style.radio}>
<label>
    <input
      type="radio"
      name="fuelType"
      value="Petrol"
      checked={newFuelType === "Petrol"}
       onChange={handleNewFuelType} 
    />
    Petrol
  </label>
  <label>
    <input type="radio" name="fuelType"
      value="diesel"
      checked={newFuelType === "diesel"}
       onChange={handleNewFuelType} 
    />
    Diesel
  </label>
  <label>
    <input
      type="radio"
      name="fuelType"
      value="electric"
      checked={newFuelType === "electric"}
       onChange={handleNewFuelType}
    />
    Electric
  </label>
  <label>
    <input
      type="radio"
      name="fuelType"
      value="hybrid"
      checked={newFuelType === "hybrid"}
       onChange={handleNewFuelType} 
    />
    Hybrid
  </label>
  </div>
</div>

<div className = {style.inputnewcar}>
 Transmission
<div className={style.radio}>
<label><input type="radio" name="Transmition"
      value="Manuel" checked={newTransmission === "Manuel"}
       onChange={handleNewTransmission}/>
    Manuel
</label>

<label><input type="radio" name="Transmition"
      value="Automatic" checked={newTransmission === "Automatic"}
       onChange={handleNewTransmission}/>
    Automatic
</label>

<label><input type="radio" name="Transmition"
      value="Hybrid" checked={newTransmission === "Hybrid"}
       onChange={handleNewTransmission}/>
    Hybrid
</label>

<label><input type="radio" name="Transmition"
      value="Sem-Automatic" checked={newTransmission === "Sem-Automatic"}
       onChange={handleNewTransmission}/>
    Sem-Automatic
</label>
</div>
</div>

<div className= {style.inputnewcar}>
Condition
<div className={style.radio}>
  <label>
    <input type="radio" name="Condition"
    value="New" checked={newCondition ==="New"}
    onChange={handleNewCondition}/>
    New Car
  </label>
  <label><input type="radio" name="Condition"
  value="Used" checked={newCondition ==="Used"}
  onChange={handleNewCondition}/>
  Used Car</label>
  </div></div>

<div className = {style.inputnewcar}>
 Body type <input className={style.inputValue} value= {newBodyType}
  onChange= {handleNewBodyType} />
</div>

<div className = {style.inputnewcar}>
 Color <input className={style.inputValue} value= {newColor}
  onChange= {handleNewColor} />
</div>

<div className = {style.inputnewcar}>
 Seats <input type="number" className={style.inputValue} value= {newSeats}
  onChange= {handleNewSeats} />
</div>

<div className = {style.inputnewcar}>
 Doors <input type="number" className={style.inputValue} value= {newDoors}
  onChange= {handleNewDoors} />
</div>

<div className = {style.inputnewcar}>
 Engine size <input type="number" className={style.inputValue} value= {newEngineSize}
  onChange= {handleNewEngineSize} />
</div>

<div className = {style.inputnewcar}>
 Status
<div className={style.radio}>
<label><input type="radio" name="status"
      value="Available"checked={newStatus === "Available"}
       onChange={handleNewStatus}/>
    Available
</label>
<label><input type="radio" name="status"
      value="Pending"checked={newStatus === "Pending"}
       onChange={handleNewStatus}/>
    Pending
</label>
<label><input type="radio" name="status"
      value="Reserved"checked={newStatus === "Reserved"}
       onChange={handleNewStatus}/>
    Reseverd
</label>
</div>
</div>

<div className = {style.inputnewcar}>
 Created at <input type="date" className={style.inputValue} value= {newCreatedAt}
  onChange= {handleNewCreatedAt} />
</div>

<div className = {style.inputnewcar}>
 Other details <input value= {newOtherDescription}
  onChange= {handleNewOtherDescription} />
</div>


<button className = {style.formonsubmit}>Submit</button>
    

</form>
  </div>
  )
}

export default  Newcar