
import { useState, useEffect } from 'react'
import motoract from './cars'
import style from './module/style.module.css'
import Brand from './brand'
import Message from './message.jsx'
import Addtocart from './addToCartButton.jsx'





const App = () => {

  const [cars, setCars] = useState([])
  const [showAll, setShowAll] = useState('')
  const [expandedCarIds, setExpandedCarIds] = useState([])
  const [isChatVisible, setIsChatVisible] = useState(false)
  const [chatTargetCar, setChatTargetCar] = useState(null)
  const [chatConfig, setChatConfig] = useState(null)
  const [cartItems, setCartItems] = useState([])

  const [isAddToCartButtonVisible, setIsAddToCartButtonVisible] = useState(false)

  //const  ADMIN_USERNAME = UserAct.getUserByUserName('Road King Motor Support')
  const ADMIN_USERNAME = 'Road King Motor Support'


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

const toggleDetails = (id) => {
  setExpandedCarIds(prev =>
    prev.includes(id) ? prev.filter(carId => carId !== id) : [...prev, id]
  );
};

const handleOpenChat = (car) => {
  setChatTargetCar(car);
  setChatConfig({
    targetName: ADMIN_USERNAME,
    carContext: car,
  })
  setIsChatVisible(true);
};


const handleCloseChat = () => {
  setIsChatVisible(false);
  setChatTargetCar(null)
  setChatConfig(null)
}

    const filtercar = cars.filter(car => (car.brand || '').toLowerCase().includes(showAll.toLowerCase()));
    const uniqueCarNames = [...new Set(cars.map(car => car.brand).filter(brand => brand))];

const closeAddToCartContent = () => {
  setIsAddToCartButtonVisible(false);
};

const handleToggleCarVisibility = () => {
  setIsAddToCartButtonVisible(prev => !prev)
}

const handleAddToCart = (car) => {
  setCartItems(prevItems => {
   // return [...prevItems, {id: car.id, model: car.model, price: car.price, images: car.images}]
    const existingItemIndex = prevItems.findIndex(item => item.id === car.id);

    if (existingItemIndex > -1) {
      return prevItems.map((item, index) => 
        index === existingItemIndex
       ? {...item, quantity: item.quantity + 1}
         : item)
    } else {
      return [...prevItems, {
        id: car.id,
        model: car.model,
        price: car.price,
        images: car.images,
        quantity: 1
      }]
    }
  });
  setIsAddToCartButtonVisible(true)
}


  return (
  <div>
    <div className={style.title}>ROAD KING MOTOR</div>
 
 <div className= {style.navbartop}>

      <button className = {style.navbuttonhome}>
      <img className= {style.home} src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-home-48.png" 
      alt="home" /> </button>
 <button className= {style.navbuttonmyaccount}>
   <img className={style.myaccount} src = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-my-account-50.png"
    alt = "myaccount" />  </button>
 <button className = {style.navbuttonaddtocart} onClick={handleToggleCarVisibility}>
   <img className = {style.addtocart} src ="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-add-to-cart-48.png"
    alt="addtocart"/> </button>

<button className= {style.settingsbutton}>
  <img className={style.settings}
   src = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-settings-48.png"
  alt = "settings"/>
</button>
<button className={style.chatbutton}>
  <img className={style.chat}
   src= "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-48.png"
  alt = "chat"/>
</button>

 </div>

 <div className={style.search}>
  <button
  className= {style.newbutton}
  onClick = {() => setShowAll('')}
  >
  Show All cars
  </button>


{ uniqueCarNames.map((brand) => (
      <button key = {cars.id}
      className= {style.navbutton}
      onClick = {() => setShowAll(brand)}>
        {brand}
      </button>
  
        ))}
     </div>
    <div className={style.filter}>
     
     {filtercar.length > 0 ? (
  filtercar.map( car => {
    console.log("Mapping car:", car.id); 
        const isExpanded = expandedCarIds.includes(car.id);
        return (
    <div key={car.id} className={style.carproparty}>
        <p>{car.images && <img src = {car.images} alt={car.model}
     style={{maxWidth: '100%', maxHeight: '200px', display: 'block', margin: '0 auto'}}/>}
      </p>
     <p>{car.brand} </p>
     <p>{car.model} </p>
    <p>{car.price}  rwf</p>

    {isExpanded && (
      <div>
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
    </div>
    )}
    <div className={style.newbutton}>
      {(() => {
        const carId = car.id;
      return(
        <button onClick={() => toggleDetails(carId)} className={style.hideAndShowButton}>
          {isExpanded ? "Hide details" : "Show more"}
        </button>
      )
    })()}
<button>Buy now</button>
<button onClick={() => handleOpenChat(car)}>Contact seller</button>
<button onClick={() => handleAddToCart(car)}>Add to cart</button>
</div>

 </div>);
 })
  ) : (
    <div>No car here</div>
  )
 }

<Brand />

{isChatVisible && chatConfig && (
      <div style={{
        position: 'fixed', overflowY: 'auto', bottom: '20px',
        right: '20px',
        width: '350px',
        maxHeight: '500px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '15px'
      }}>
        <Message targetName={chatConfig.targetName} onClose={handleCloseChat} />
      </div>
    )}

    </div>
{isAddToCartButtonVisible && (
  <div style={{position: 'fixed', overflowY: 'auto', bottom: '20px',  right: '20px',
          width: '350px',   maxHeight: '100%',   backgroundColor: 'white',   border: '1px solid #ccc',
          borderRadius: '8px',  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',   zIndex: 1000,
          display: 'flex',  flexDirection: 'column',     padding: '15px'
        }}>
    <Addtocart cartItems={cartItems} onClose={closeAddToCartContent} />
  </div>
)}

  <div className={style.lineAboveFooter}></div>
  </div>
  )
}

export default App