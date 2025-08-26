import React, { useState, useEffect } from 'react'
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
import CarDetailModal from './carDetailsModals.jsx'
import io from 'socket.io-client';
import { toast } from 'react-toastify';


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
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [topCarId, setTopCarId] = useState(null);
  const [conditionFilter, setConditionFilter] = useState('')
  const [notifications, setNotifications] = useState([]);

  const handleCommentPosted = React.useCallback(() => setRefresh(prev => prev + 1), []);
  const ADMIN_USERNAME = 'Road King Motor Support'

  useEffect(() => {
    try{
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    let socket;
    if (token && user) {
      setCurrentUser(JSON.parse(user));
}
if (user) {
      const userId = JSON.parse(user)?.id;

      const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.hostname + ':5000';

      socket = io(socketUrl, {
        auth: {
          userId: userId,
          token: token,
        },
        transports: ['websocket'],
      });

      socket.on('receiveMessage', (data) => {
        const message = data.message || 'New message!'
        toast.info(message, {
          position: 'top-right',
        });
        setUnreadMessagesCount(prevCount => prevCount + 1);
        setLastMessageTime(new Date());
      });

    socket.on('newComment', (data) => {
      console.log('New comment received:',data);
      setNewCommentsCount((prevCount) => prevCount + 1);
      toast.info('New comment posted!', {
        position: 'center',
        autoClose: 13000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    });

    socket.on('receiveNotification', (data) => {
    console.log('Notification received:', data);
    toast.info(data.message, {
    position: 'top',
});

    // optional: add to state list if you want to display later
    const newNotification = { type: data.type || 'notification', text: data.message, time: new Date() };
    console.log('New notification object:', newNotification);

    setNotifications(prev => [
      ...prev,
      { type: data.type || 'notification', text: data.message, time: new Date() }
    ]);
  });
      cartAxios.getCart(userId)
        .then(response => {
          setCartItems(response.data);
        })
        .catch(error => console.error("Error fetching cart on initial load:", error));
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
    let filtercar = filterCarsByBrand.filter(car =>
    (car.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (car.brand || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

 if (conditionFilter === 'New' || conditionFilter === 'Used') {
    filtercar = filtercar.filter(car => car.condition === conditionFilter);
  }

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
  setTopCarId(carId)
  setCommentSectionCarIds(prev =>
    prev.includes(carId)
      ? prev.filter(id => id !== carId)
      : [...prev, carId]
  );
};

const toggleNotificationVisibility = () => {
  setIsNotificationVisible(!isNotificationVisible);
};

const sortedCars = [...filtercar].sort((a, b) => {
  if (topCarId === a.id) {
    return -1;
  } else if (topCarId === b.id) {
    return 1;
  } else {
    return 0;
  }
})

  return (
  <div>
  <div className={style.contentToBeFixed}>
    <div className={style.title}>

      <h1 className={style.titletext}><strong>ROAD KING MOTOR</strong></h1>
      <div className={style.conditionbutton}>
      <button onClick={() => setConditionFilter('New')}>New Car</button>
      <button onClick={() => setConditionFilter('Used')}>Used Car</button>
      <button>Pending Car</button>
      </div>
 <div className= {style.navbarbutton}>

      {currentUser ? (
        <>
          <span className={style.welcomeMessage}>{currentUser.userName}!</span>
          <button onClick={handleLogout} className={style.topButton}>Logout</button>
        </>
      ) : (
        <button className= {style.navbuttonmyaccount} onClick={handleToggleLoginVisibility}>
          <img className={style.topButton} src = "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-my-account-50.png"
            alt = "myaccount" />
        </button>
      )}

 <button className = {style.navbuttonaddtocart} onClick={handleToggleCarVisibility}>
   <img className = {style.topButton} src ="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-add-to-cart-48.png"
    alt="addtocart"/> </button>
{/*
<button 
className={style.navbuttonNotification}
onClick={toggleNotificationVisibility}>
  <img className={style.topButton}
  src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/notification_icon.svg"
  alt="notification" />

  {newCommentsCount > 0 && (
    <span className={style.notificationBadge}>
      {newCommentsCount}
    </span>
  )}
</button>
*/}
    {!isChatVisible ? (
      <button onClick={() => handleOpenChat(null)}>
      {/*
        <img className={style.topButton}
  src= "https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-48.png"
  alt = "chat"/>
  */}
  <span>Message</span>
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

{isNotificationVisible && (
  <div className={style.notificationDropdown}>
    <button onClick={toggleNotificationVisibility} className={style.closeButton}>Close</button>
    <h3>Notifications</h3>
    {notifications.length > 0 ? (
      notifications.map((n, idx) => {
        return (
        <div key={idx} className={style.notificationItem}>
          <strong>{n.type.toUpperCase()}:</strong> {n.text}
          <small>{n.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
        </div>
        )
})
    ) : (
      <p>No new notifications</p>
    )}
  </div>
)}


  </div>
 </div>

 {isLoginVisible && !currentUser && (
  <div className={style.authFormContainer}>
            <button onClick={handleToggleLoginVisibility}
            className={style.closebutton}
         style={{marginTop: '10px' }}>
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

<div className={style.conditionbuttonOnPhone}>
  <select
    value={conditionFilter}
    onChange={(e) => setConditionFilter(e.target.value)}
  >
    <option value="">Filter Condition</option>
    <option value="New">New</option>
    <option value="Used">Used</option>
  </select>
</div>



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
     {sortedCars.length > 0 ? (
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
        

              <svg className={`${style.buttonSvg} ${car.condition === 'Used' ? style['buttonSvg-Used'] : ''}`}
      viewBox="0 0 200 250"
      xmlns="http://www.w3.org/2000/svg">
      <polygon
      id = "starburst"
      points = {generateStarPoints(25, 100, 80, 90, 80).join(',')}
        fill={car.condition === 'Used' ? 'blue' : 'red'}
        transform = "rotate(-90, 100, 100)"
      />
      <text
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={car.condition === 'New' ? '55' : '65'}
        fill="white"
        y="40%"
        x="40%"
      >
        {car.condition}
      </text>
</svg>

<svg className={`${style.buttonSvgOvel} ${car.status === 'Pending' ? style['buttonSvgOvel-Pending'] : ''}`}
        viewBox="0 0 250 250" style={{ display: car.status === 'Pending' ? 'block' : 'none' }}
      xmlns="http://www.w3.org/2000/svg">
<polygon 
id="starBustOval"
 points={generateStarPointsOval( 45, 170, 100, 25, 60, 30, 65).join(' ')}
        fill={car.status == 'Pending' ? 'orange' : 'yellow'}
        transform = "rotate(-90, 100, 100)"/>
        <text
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize= "25"
        fontWeight="bold"
        fill="blue"
        y="13%"
        x="40%" >
      {car.status}
    </text>
</svg>
  <div className={style.model}>{car.model}</div>
  <div className={style.price}> ${car.price} </div>
      </div>
    
 <div className={style.carpropartyOtherProperty}>
  <div className={style.carProperty}>

  year: {car.year}
  
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
<div className={`${style.comment} ${commentSectionCarIds.includes(car.id) ? `${style.absolute} ${style.otherStyle}` : style.static}`}>
<button className={`${style.hideAndShowButton}`}
 onClick={(event) => handleToggleComments(event, car.id)}>
{commentSectionCarIds.includes(car.id) ? 'Hide Comments' : 'Show Comments'}
</button>

 
 <AverageRating carId={car.id} refresh={refresh} />
 {commentSectionCarIds.includes(car.id) && (
  
    <CommentsList carId={car.id} refresh={refresh} onCommentPosted={handleCommentPosted}/>

  )}
  </div>
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
        onNewMessage={() => {
        console.log('onNewMessage callback triggered!')
        setUnreadMessagesCount(prev => prev + 1)}}

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

  function generateStarPoints(numPoints, cx, cy, outerRadius, innerRadius) {
  const points = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = i * Math.PI / numPoints;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points;
}

function generateStarPointsOval(numPoints, cx, cy, outerRadiusX, outerRadiusY, innerRadiusX, innerRadiusY) {
  const points = [];
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints;
    const radiusX = i % 2 === 0 ? outerRadiusX : innerRadiusX;
    const radiusY = i % 2 === 0 ? outerRadiusY : innerRadiusY;

    const x = cx + radiusX * Math.cos(angle);
    const y = cy + radiusY * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points;
}

export default App;