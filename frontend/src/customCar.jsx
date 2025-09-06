import { useState } from 'react'
import customCaract from './axios/customCar.js'
import style from './module/customCarStyle.module.css'

const CustomCar = ({onClose}) => {
  const [errorMessage, setErrorMessage] = useState(null)

  // Form state
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

  const [newOtherDescription, setNewOtherDescription] = useState('')

  // Reset form
  const resetForm = () => {
    setNewBrand('')
    setNewModel('')
    setNewPrice('')
    setNewYear('')
    setNewMadeIn('')
    setNewMileage('')
    setNewFuelType('')
    setNewTransmission('')
    setNewBodyType('')
    setNewColor('')
    setNewSeats('')
    setNewDoors('')
    setNewEngineSize('')
    setNewStatus('')
    setNewCondition('')
    setNewOtherDescription('')
  }

  // Handle form submit
  const addCustomCar = (e) => {
    e.preventDefault()

    const storedUser = localStorage.getItem('currentUser')
    if (!storedUser) {
      console.error('User not found in localStorage. Please log in.')
      setErrorMessage('User not found. Please log in.')
      return
    }

    const user = JSON.parse(storedUser)
    const userId = user.id

    // Build request body
    const newCustomCar = {
      user: userId,
      brand: newBrand,
      model: newModel,
      price: newPrice ? Number(newPrice) : undefined,
      year: newYear ? Number(newYear) : undefined,
      madeIn: newMadeIn,
      mileage: newMileage ? Number(newMileage) : undefined,
      fuelType: newFuelType,
      transmission: newTransmission,
      bodyType: newBodyType,
      color: newColor,
      seats: newSeats ? Number(newSeats) : undefined,
      doors: newDoors ? Number(newDoors) : undefined,
      engineSize: newEngineSize,
      status: newStatus,
      condition: newCondition,
      createdAt: new Date().toISOString(),
      otherDescription: newOtherDescription
    }

    // Send to backend
    customCaract
      .createCustom(newCustomCar)
      .then(() => {
        resetForm()
      })
      .catch((error) => {
        console.error(error.response?.data?.error || error.message)
        setErrorMessage(`Error: ${error.response?.data?.error || 'Unknown error'}`)
      })

    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  return (
    <div className={style.newcar}>
      <h2 className={style.customCarHeader}>Customize Your Car</h2>
      {/*<button className={style.backButton} onClick={() => window.history.back()}>Back</button>*/}
      {onClose && <button className={style.closebutton} onClick={onClose}>&#8592;
        <span>back</span></button>}
      <div className={style.guide}>Fill this form based on your wish, fill what you want only, all field are not mandatory.</div>

      <form className={style.formnewcar} onSubmit={addCustomCar}>
        <div className={style.inputcustomcar}>
          Brand
          <input
            className={style.inputValue}
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Model
          <input
            className={style.inputValue}
            value={newModel}
            onChange={(e) => setNewModel(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Price
          <input
            type="number"
            className={style.inputValue}
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Year
          <input
            type="number"
            className={style.inputValue}
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Made in
          <input
            className={style.inputValue}
            value={newMadeIn}
            onChange={(e) => setNewMadeIn(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Mileage
          <input
            type="number"
            className={style.inputValue}
            value={newMileage}
            onChange={(e) => setNewMileage(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Fuel type
          <div className={style.radio}>
            {['Petrol', 'Diesel', 'Electric', 'Hybrid'].map((type) => (
              <label key={type}>
                <input
                  type="radio"
                  name="fuelType"
                  value={type}
                  checked={newFuelType === type}
                  onChange={(e) => setNewFuelType(e.target.value)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className={style.inputcustomcar}>
          Transmission
          <div className={style.radio}>
            {['Manual', 'Automatic', 'Hybrid', 'Semi-Automatic'].map((t) => (
              <label key={t}>
                <input
                  type="radio"
                  name="transmission"
                  value={t}
                  checked={newTransmission === t}
                  onChange={(e) => setNewTransmission(e.target.value)}
                />
                {t}
              </label>
            ))}
          </div>
        </div>

        <div className={style.inputcustomcar}>
          Condition
          <div className={style.radio}>
            <label>
              <input
                type="radio"
                name="condition"
                value="New"
                checked={newCondition === 'New'}
                onChange={(e) => setNewCondition(e.target.value)}
              />
              New Car
            </label>
            <label>
              <input
                type="radio"
                name="condition"
                value="Used"
                checked={newCondition === 'Used'}
                onChange={(e) => setNewCondition(e.target.value)}
              />
              Used Car
            </label>
          </div>
        </div>

        <div className={style.inputcustomcar}>
          Body type
          <input
            className={style.inputValue}
            value={newBodyType}
            onChange={(e) => setNewBodyType(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Color
          <input
            className={style.inputValue}
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Seats
          <input
            type="number"
            className={style.inputValue}
            value={newSeats}
            onChange={(e) => setNewSeats(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Doors
          <input
            type="number"
            className={style.inputValue}
            value={newDoors}
            onChange={(e) => setNewDoors(e.target.value)}
          />
        </div>

        <div className={style.inputcustomcar}>
          Engine size
          <input
            className={style.inputValue}
            value={newEngineSize}
            onChange={(e) => setNewEngineSize(e.target.value)}
          />
        </div>
     {/*
        <div className={style.inputcustomcar}>
          Status
          <div className={style.radio}>
            {['Available', 'Pending', 'Reserved'].map((s) => (
              <label key={s}>
                <input
                  type="radio"
                  name="status"
                  value={s}
                  checked={newStatus === s}
                  onChange={(e) => setNewStatus(e.target.value)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
   
<div className = {style.inputcustomcar}> 
  Created at <input
   type="date" className={style.inputValue} 
   value= {newCreatedAt}
    onChange= {(e) => setNewCreatedAt(e.target.value)} />
 </div>
*/}
        <div className={style.inputcustomcar}>
          Other details
          <input
            className={style.inputValue}
            value={newOtherDescription}
            onChange={(e) => setNewOtherDescription(e.target.value)}
          />
        </div>

        {errorMessage && <p className={style.error}>{errorMessage}</p>}

        <button className={style.formonsubmit}>Submit</button>
      </form>
    </div>
  )
}

export default CustomCar
