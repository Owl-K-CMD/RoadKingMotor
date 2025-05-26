import { useState } from 'react'
import motoractadmin from './carsAdmin.js'
import style from './style.module.css'
//import { set } from 'mongoose';

const Newcar = () => {
  
  const [newCar, setNewCar] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [newImage, setNewImage] = useState('')
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCurrency, setNewCurrency] = useState('')
  const [newDateOfRelease, setNewDateOfRelease] = useState('')
  const [newDescription, setNewDescription] = useState('')


const addCar = (e) => {
  e.preventDefault();

  const newCarObject = {
    image: newImage,
    name: newName,
    price: newPrice,
    currency: newCurrency,
    dateOfRelease: newDateOfRelease,
    description: newDescription
  }

const formData = new FormData();
formData.append('image', newImage);
formData.append('name', newName);
formData.append('price', newPrice);
formData.append('currency', newCurrency);
formData.append('dateOfRelease', newDateOfRelease);
formData.append('description', newDescription);


  motoractadmin
  .create(newCarObject)
  .then(response => {
    setNewCar(newCar.concat(response));
    setNewImage('');
    setNewName('');
    setNewPrice('');
    setNewCurrency('');
    setNewDateOfRelease('');
    setNewDescription('')
    
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

const handleNewName = (e) => {
setNewName(e.target.value);
}

const handleNewPrice = (e) => {
setNewPrice(e.target.value);
}

const handleNewCurrency = (e) => {
setNewCurrency(e.target.value);
}

const handleNewDateOfRelease = (e) => {
setNewDateOfRelease(e.target.value);
}

const handleNewDescription = (e) => {
setNewDescription(e.target.value);
}

  return (
<div>
<form className={style.formnewcar} onSubmit= {addCar}>
<div className = {style.inputnewcar}>
 Images <input type="file" id="newCarImageInput"
  onChange= {handleNewImage} />
</div>

<div className = {style.inputnewcar}>
 Name <input value= {newName}
  onChange= {handleNewName} />
</div>

<div className = {style.inputnewcar}>
 Price <input type="number" value= {newPrice}
  onChange= {handleNewPrice} />
</div>

<div className = {style.inputnewcar}>
 currency <input value= {newCurrency}
  onChange= {handleNewCurrency} />
</div>

<div className = {style.inputnewcar}>
 date of release <input type="date" value= {newDateOfRelease}
  onChange= {handleNewDateOfRelease} />
</div>

<div className = {style.inputnewcar}>
 Description <textarea value= {newDescription}
  onChange= {handleNewDescription} />
</div>
<button className = {style.formonsubmit}>Submit</button>
    

</form>
  </div>
  )
}

export default  Newcar