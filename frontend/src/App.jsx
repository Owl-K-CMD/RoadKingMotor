import { useState, useEffect } from 'react'
import motoract from './cars'
import style from './module/style.module.css'
import Message from './message.jsx'
import Addtocart from './addToCartButton.jsx'
import Footer from './footer.jsx'
import AuthForm from './authForm.jsx'
import cartAxios from './cartAxios.js'
import { setLogoutCallback } from './cartAxios.js'
import AverageRating from './AverageRating.jsx'
import CommentsList from './commentdisplay.jsx'
import CommentForm from './commentForm.jsx'
import CarDetailModal from './carDetailsModals.jsx'

const App = () => {

  const [cars, setCars] = useState([])
  const [showAll, setShowAll] = useState('')
  const [expandedCarIds, setExpandedCarIds] = useState([])
  const [isChatVisible, setIsChatVisible] = useState(false)
  const [chatTargetCar, setChatTargetCar] = useState(null)
  const [chatConfig, setChatConfig] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [currentImageIndices, setCurrentImageIndices] = useState({})
  const [isAddToCartButtonVisible, setIsAddToCartButtonVisible] = useState(false)
  const [isLoginVisible, setIsLoginVisible] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [pendingChatAction, setPendingChatAction] = useState(null)
  const [pendingCartAction, setPendingCartAction] = useState(null)
  const [commentSectionCarIds, setCommentSectionCarIds] = useState([])
  const [refresh, setRefresh] = useState(0)
  const [selectedCar, setSelectedCar] = useState(null)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const ADMIN_USERNAME = 'Road King Motor Support'

  useEffect(() => {
    try{
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      setCurrentUser(JSON.parse(user));
}
const userId = user ? JSON.parse(user).id : null;
if (userId && token) {
  cartAxios.getCart(userId)
  .then(response => {
    setCartItems(response.data)
  })
  .catch (error => console.error("Error fetching cart on initial load:", error))
} else {
  setCartItems([])
}
    } catch (error) {
      console.error("Error initialing app state from localStorage:", error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('refreshToken');
      setCurrentUser(null);
      setCartItems([]);
    }
}, [])

   useEffect(() => {
    setLogoutCallback(handleLogout)
   }, [])

   useEffect(() => {
    motoract.getAll()
    //setIsLoading(true)
      .then(initialCars => {

        if (Array.isArray(initialCars)) {
          setCars(initialCars);
          const initialIndices = {};
          initialCars.forEach(car => {
            if (car.id && car.images && Array.isArray(car.images) && car.images.length > 0) {
              initialIndices[car.id] = 0;
            }
          });

          setCurrentImageIndices(initialIndices);
          console.log('Cars state succesfully');
           } else {
            console.error("Error: Data received from server is not array!", initialCars)
           
        setCars([])
       alert("Could not load data correctly.")
           }
      })
       .finally(() => setIsLoading(false))
      .catch(error => {
       console.error("Error fetching data:", error);
      })
    }, []);


    const handleImageNavigation = (carId, direction) => {
      const car = cars.find(c => c.id === carId);
      if (!car || !Array.isArray(car.images) || car.images.length === 0)
        {
          return;
        }
      setCurrentImageIndices(prevIndices => {
        const currentIndex = prevIndices[carId] || 0;
        let nextIndex;

        if (direction === 'next') {
          nextIndex = (currentIndex + 1) % car.images.length;
        } else {
          nextIndex = (currentIndex - 1 + car.images.length) % car.images.length;
        }
        return { ...prevIndices, [carId]: nextIndex };
      });
    }


const toggleDetails = (id) => {
  setExpandedCarIds(prev =>
    prev.includes(id) ? prev.filter(carId => carId !== id) : [...prev, id]
  );
};

const handleOpenChat = (car) => {
  if (!currentUser) {
    setIsLoginVisible(true);
    setPendingChatAction({ open: true, carContext: car});
    return;
  }

  setChatTargetCar(car);
  setChatConfig({
    targetName: ADMIN_USERNAME,
    unreadMessageCount: 0,
    carContext: car,
  })
  setIsChatVisible(true);
};


const handleCloseChat = () => {
  setIsChatVisible(false);
  setChatTargetCar(null)
  setChatConfig(null)
  setUnreadMessagesCount(0);
}

  const filterCarsByBrand = cars.filter(car => (car.brand || '').toLowerCase().includes(showAll.toLowerCase()));
  const filtercar = filterCarsByBrand.filter(car => 
    (car.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (car.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
  );


  //const filtercar = cars.filter(car => (car.brand || '').toLowerCase().includes(showAll.toLowerCase()));
  const uniqueCarNames = [...new Set(cars.map(car => car.brand).filter(brand => brand))];


const closeAddToCartContent = () => {
  setIsAddToCartButtonVisible(false);
};

const handleToggleCarVisibility = () => {
  setIsAddToCartButtonVisible(prev => !prev)
}

const handleAddToCart = (car) => {
    const existingItemIndex = cartItems.findIndex(item => item.id === car.id);

    let newCartItems;

    if (existingItemIndex > -1) {
      newCartItems = cartItems.map((item, index) =>
      index === existingItemIndex
    ? {...item, quantity: item.quantity + 1}
  : item);
    } else {
      newCartItems = [...cartItems, {
        id: car.id,
        model: car.model,
        price: car.price,
        images: [car.images[0]],
        quantity: 1
      }];

    }
    setCartItems(newCartItems);


  const token = localStorage.getItem('authToken');
  if (currentUser && token) {
    const userId = currentUser.id;
     console.log("handleAddtoCart: currentUser:", currentUser);
     console.log("handleAddToCart: userId:", userId);
     console.log("handleAddToCart: token:", token)
    cartAxios.updateCart(userId, newCartItems)
    .catch(error => console.error("Error updating cart on backend:", error))
  }
  setIsAddToCartButtonVisible(false)
}


const handleToggleLoginVisibility = () => {
  setIsLoginVisible(prev => !prev);
}

const handleLoginSuccess = (userData) => {
  setCurrentUser(userData);
  setIsLoginVisible(false);
  if (pendingChatAction && pendingChatAction.open) {
    handleOpenChat(pendingChatAction.carContext);
    setPendingChatAction(null);
  }

  if (pendingCartAction && pendingCartAction.type === 'add') {
    handleAddToCart(pendingCartAction.car);
    setPendingCartAction(null);
    setPendingChatAction(null);
  }
}


const handleLogout = () => {
  console.log("Executing handleLogout: Clearing session.");
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('refreshToken');
  setCurrentUser(null);
  setCartItems([])
}

const handleToggleComments = (event, carId) => {
  event.preventDefault();
  event.stopPropagation();
  setCommentSectionCarIds(prev =>
    prev.includes(carId)
      ? prev.filter(id => id !== carId)
      : [...prev, carId]
  );
};

const handleCommentPosted =  () => {
  setRefresh(prev => prev + 1)
}


  return (
  <div>
  <div className={style.contentToBeFixed}>
    <div className={style.title}>
  
      <h1 className={style.titletext}><strong>ROAD KING MOTOR</strong></h1>
  

   
 
 <div className= {style.navbarbutton}>
{/*
      <button className = {style.navbuttonhome}>
      <img className= {style.home} src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-home-48.png" 
      alt="home" /> </button>
*/}
      {currentUser ? (
        <>
          <span className={style.welcomeMessage}>{currentUser.userName}!</span>
          <button onClick={handleLogout} className={style.navbuttonmyaccount}>Logout</button>
        </>
      ) : (
        <button className= {style.navbuttonmyaccount} onClick={handleToggleLoginVisibility}>
          <img className={style.myaccount} src = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-my-account-50.png"
            alt = "myaccount" />
        </button>
      )}

 <button className = {style.navbuttonaddtocart} onClick={handleToggleCarVisibility}>
   <img className = {style.addtocart} src ="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-add-to-cart-48.png"
    alt="addtocart"/> </button>
{/*
<button className= {style.settingsbutton}>
  <img className={style.settings}
   src = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-settings-48.png"
  alt = "settings"/>
</button>
*/}
<button className={style.navbuttonNotification}>
  <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/notification_icon.svg"
  alt="notification" />
</button>
    {!isChatVisible ? (
      <button onClick={() => handleOpenChat(null)}><img className={style.chat}
   src= "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-48.png"

  alt = "chat"/>
     {unreadMessagesCount > 0 && (
    <span className={style.notificationBadge}>
      {unreadMessagesCount}
    </span>
       )}
  </button>
    ) : (
      <button onClick={handleCloseChat}>
        <img className={style.chat} src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-48.png" alt="chat" />
      </button>
    )}
  

  </div>
 </div>

 {isLoginVisible && !currentUser && (
  <div className={style.authFormContainer}>
            <button onClick={handleToggleLoginVisibility}
            className={style.closebutton}
         style={{ marginTop: '10px' }}>
          Close
        </button>
                <AuthForm onLoginSuccess={handleLoginSuccess}
                onClose={handleToggleLoginVisibility}
                 />

      </div>

 )
  }
    <div className={style.searchAndFilter}>
    <div className={style.searchContainer}>
          <button className={style.svgsearch}>
          <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/search_icon.svg" alt='search'/>
        </button>
        <input
         type="text"
         placeholder='Search by model or brand...'
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
         className={style.searchInput}
       /></div>
     <div className={style.filterContainer}>
      
      <button
        className={style.filterHamburger}
        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
        aria-expanded={isFilterMenuOpen}
        aria-controls="filter-menu"
      >
        ☰ Filter Brands
      </button>

      <div id="filter-menu" className={`${style.search} ${isFilterMenuOpen ? style.filterMenuOpen : ''}`}>
        
        <button
          className={style.navbutton}
          onClick={() => { setShowAll(''); setIsFilterMenuOpen(false); }}
        >
          <strong>Show All cars</strong>
        </button>
        {uniqueCarNames.map((brand) => (
          <button key={brand}
            className={style.navbutton}
            onClick={() => {
              setShowAll(brand);
              setIsFilterMenuOpen(false);
            }}>
            <strong> {brand}</strong>
          </button>
        ))}
      </div>
    </div>
    </div>
    
     </div>
     <div className={style.contentToScroll}>
    <div className={style.filter}>
     {filtercar.length > 0 ? (
  filtercar.map( car => {
    if (selectedCar && selectedCar.id === car.id) {
      return (
        
  <CarDetailModal car={selectedCar}
    onClose={() => setSelectedCar(null)}
    onAddToCart={handleAddToCart}
    onOpenChat={handleOpenChat}
    currentUser={currentUser}
    onCommentPosted={handleCommentPosted}
    refresh={refresh}

  />

      )
    }

        const currentImageIndex = currentImageIndices[car.id] || 0; 
      //console.log(`Car: ${car.model}, First image URL: ${car.images ? car.images[0] : 'No images'}`)
        const isExpanded = expandedCarIds.includes(car.id);

              let rawFirstImageUrl = null;

        if (Array.isArray(car.images) && car.images.length > 0 && typeof car.images[0] === 'string' && car.images[0].trim() !== '') {
          rawFirstImageUrl = car.images[0].trim();
        } else if (typeof car.images === 'string' && car.images.trim() !== '') {
          rawFirstImageUrl = car.images.trim();
        }
               // console.log(
          //`Car: ${car.model} (Background Image Processing)`,
          //`| car.images data:`, car.images,
          //`| Extracted rawFirstImageUrl: "${rawFirstImageUrl}"` contentToBeFixed
        //);


        const firstImageUrlForBackground = rawFirstImageUrl ? encodeURI(rawFirstImageUrl) : null;

        return (
    <div key={car.id} className={style.carproparty}
    onClick={() => 
      setSelectedCar(car)}

         style={firstImageUrlForBackground ? {
        backgroundImage: `url(${firstImageUrlForBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}>
    
        <div className={style.imgandits}>
          {car.images && Array.isArray(car.images) && car.images.length > 0 ? (
            <>
              <img
                src={car.images[currentImageIndex]}
                alt={`${car.model} ${currentImageIndex + 1}`}
                className={style.img}
              />
              {car.images.length > 1 && (
                <div className={style.imageNavigation}>
                  <button 
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleImageNavigation(car.id, 'prev')}}
                    className={style.imageNavButton} 
                  >
                    &lt; Prev
                  </button>
                  <span className={style.imageCounter}> {}
                    {currentImageIndex + 1} / {car.images.length}
                  </span>
                  <button 
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleImageNavigation(car.id, 'next')}} 
                    className={style.imageNavButton} 
                  >
                    Next &gt;
                  </button>
                </div>
              )}
            </>
        ) : car.images && typeof car.images === 'string' ? (

         <img src = {car.images} alt={car.model} className={style.img}/>
        ) : ( <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-no-image" />
        )}
        
      </div>
    
 <div className={style.carpropartyOtherProperty}>
  <div className={style.carProperty}>
        <div className={style.carpropartyp}><h3 className={style.carContext}>Model: </h3>{car.model} {car.year} </div>
        <div className={style.carpropartyp}><h3 className={style.carContext}>Price: </h3>{car.price}  $</div>
        <div className={style.carpropartyp}><h3 className={style.carContext}>Year of realise: </h3>{car.year} </div>
  </div>
    <div className={style.otherDescription}>
      <div className={style.carpropartyp}><h3 className={style.carContext}></h3>{car.otherDescription}</div>
      </div>
 </div>
    {isExpanded && (
      <div className={style.carpropartyDetails}>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Brand: </h3>{car.brand} </div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Made in: </h3>{car.madeIn}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Mileage: </h3>{car.mileage}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Fuel Type: </h3>{car.fuelType}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Car body: </h3>{car.bodyType}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Transmission: </h3>{car.transmission}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Color: </h3>{car.color}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Seats: </h3>{car.seats}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Doors: </h3>{car.doors}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Engine Size: </h3>{car.engineSize}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Status: </h3>{car.status}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}>Created At: </h3>{car.createdAt}</div>
    <div className={style.carpropartyp}><h3 className={style.carContext}></h3>{car.otherDescription}</div>
    
    </div>
    )}
    <div className={style.newbutton}>
      {(() => {
        const carId = car.id;
        const handleToggleDetails = (event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleDetails(carId);
        }
      return(
        <button  className={style.button} onClick={handleToggleDetails} >
          {isExpanded ? "Hide details" : "Show more"}
        </button>
      )
    })()}
<button className={style.button}
onClick={(event) => {
  event.preventDefault()
  event.stopPropagation()

}} >Buy now</button>
<button className={style.button} onClick={(event) =>{
  event.preventDefault()
  event.stopPropagation()
  handleOpenChat(car); }}>Contact seller</button>

<button  className={style.button} onClick={(event) => {
  event.preventDefault()
  event.stopPropagation()
  
handleAddToCart(car)}}>Add to cart</button>
</div>

<button onClick={(event) => handleToggleComments(event, car.id)}>
{commentSectionCarIds.includes(car.id) ? 'Hide Comments' : 'Show Comments'}
</button>

 
 <AverageRating carId={car.id} refresh={refresh} />
 {commentSectionCarIds.includes(car.id) && (
  
  <div>
    <CommentsList carId={car.id} refresh={refresh} />
    {currentUser && (
      <CommentForm carId={car.id} onCommentPosted={handleCommentPosted} />
    )}
  </div>

  )}
  
  </div>
        )
 })
  ) : (
    <div>Loading...</div>
  )
 }
{isChatVisible && chatConfig && (
      <div className={style.chatContainer}>
        <Message 
        targetName={chatConfig.targetName}
        onClose={handleCloseChat}
        onNewMessage={() => setUnreadMessagesCount(prev => prev + 1)}
        unreadMessagesCount={unreadMessagesCount}
        setUnreadMessagesCount={setUnreadMessagesCount}
        />
      </div>
    )}

    </div>
{isAddToCartButtonVisible && (
  <div className={style.cartContainer}>
    <Addtocart cartItems={cartItems} onClose={closeAddToCartContent} />
  </div>
)}

  <div className={style.lineAboveFooter}></div>
  <Footer />
  </div>
  </div>
  )
}

export default App