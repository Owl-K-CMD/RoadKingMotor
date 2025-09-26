import { useNavigate, useSearchParams } from 'react-router-dom'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import motoract from './cars'
import style from './module/style.module.css'
import Message from './message.jsx'
import Addtocart from './addToCartButton.jsx'
import Footer from './footer.jsx'
import AuthForm from './authForm.jsx'
import CustomCarHome from './customCarHome.jsx'
import cartAxios from './cartAxios.js'
import { setLogoutCallback } from './cartAxios.js'
import AverageRating from './AverageRating.jsx'
import CommentsList from './commentdisplay.jsx'
import CarDetailModal from './carDetailsModals.jsx'
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { initSocket } from './socket.js'


const App = () => {

  const navigate = useNavigate();
  const [cars, setCars] = useState([])
  const [showAll, setShowAll] = useState('')
  const [expandedCarIds, setExpandedCarIds] = useState([])
  const [isChatVisible, setIsChatVisible] = useState(false)
  const [chatTargetCar, setChatTargetCar] = useState(null)
  const [chatConfig, setChatConfig] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [currentImageIndices, setCurrentImageIndices] = useState({})
  const [isAddToCartButtonVisible, setIsAddToCartButtonVisible] = useState(false)
  const [isLoginVisible, setIsLoginVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [pendingChatAction, setPendingChatAction] = useState(null)
  const [pendingCartAction, setPendingCartAction] = useState(null)
  const [commentSectionCarIds, setCommentSectionCarIds] = useState([])
  const [refresh, setRefresh] = useState(0)
  const [selectedCar, setSelectedCar] = useState(null)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const [newCommentsCount, setNewCommentsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [topCarId, setTopCarId] = useState(null);
  const [conditionFilter, setConditionFilter] = useState('')
  const [notifications, setNotifications] = useState([]);
  const [isCustomCarHomeVisible, setIsCustomCarHomeVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFilterCarBrandVisible, setIsFilterCarBrandVisible] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [customCars, setCustomCars] = useState([])
  const [messages, setMessages] = useState([]);
  const [customCarBuble, setCustomCarBuble] = useState(false)
  const socketRef = useRef(null);


    useEffect(() => {
    if (!searchParams.get('car') && !searchParams.get('model')) {
      setSelectedCar(null);
    }
  }, [searchParams]);

      useEffect(() => {
    const carId = searchParams.get('car');

    if (carId) {
      motoract.getById(carId)
        .then(car => {
          setSelectedCar(car);
        })
        .catch(error => {
          console.error("Error fetching car details:", error);
        });
    }
  }, [searchParams]);
  
  const handleCommentPosted = React.useCallback(() => setRefresh(prev => prev + 1), []);
  const ADMIN_USERNAME = 'Road King Motor Support'


    useEffect(() => {
      initSocket();
    }, [])
  

  useEffect(() => {
    try{
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
      setCurrentUser(JSON.parse(user));
}
if (user) {
      const userId = JSON.parse(user)?.id;
      const socketUrl= import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
      
      socketRef.current = io(socketUrl, {
        auth: {
        userId: userId,
        token: token,
        },
        transports: ['websocket'],
          withCredentials: true,
      });

  socketRef.current.on('receiveMessage', (data) => { 
      console.log("receiveNessage event trigered:", data)
        const message = data.message || 'New message!';
          const receiverId = JSON.parse(localStorage.getItem('currentUser'))?.id;
      if (data?.receiver?.id === receiverId) {
            toast.info(message, {
            position: 'top-right',
          });
          setUnreadMessagesCount(prevCount => prevCount + 1);
        }
          setMessages(prev => [...prev, data]);
          setLastMessageTime(new Date());
      });

    socketRef.current.on('newComment', (data) => {
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

socketRef.current.on('newCustomCar', (data) => {
  console.log('new custom car received:', data)
  toast.info('New custom car request received!', {
    position: 'top-right',
  });
})

socketRef.current.on('updateCustomCar', (updatedCustomCar) => {
  setCustomCarBuble(true);
  setCustomCars(prevCars => {
    return prevCars.map(customCar => {
      if (customCar.id === updatedCustomCar.id) {
        return { ...customCar, tracks: updatedCustomCar.tracks };
      }
      return customCar;
    })
  })
  toast.info(`Custom car with ID ${updatedCustomCar.id} has been updated!`, {
    position: 'top-right',
  });
  
})


    socketRef.current.on('receiveNotification', (data) => {
    console.log('Notification received:', data);
    toast.info(data.message, {
    position: 'top',
});


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

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket on cleanup');
        socketRef.current.disconnect();
      }
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
    const params = new URLSearchParams(searchParams);
    params.set('auth', 'true');
    setSearchParams(params, { replace: false });
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

  const params = new URLSearchParams(searchParams);
  if(car && car.id) params.set('chat', String(car.id));
  else params.set('chat', 'true');
  setSearchParams(params, { replace: false });
};


const handleCloseChat = () => {
  const params = new URLSearchParams(searchParams);
  params.delete('chat');
  setSearchParams(params, { replace: false });
  setIsChatVisible(false);
  setChatTargetCar(null)
  setChatConfig(null)
  setUnreadMessagesCount(0);
}

useEffect(() => {
  const chatParam = searchParams.get('chat');
  if (chatParam) {
    // if chatParam is a car id, try to match car; otherwise open generic chat
    const car = cars.find(c => String(c.id) === chatParam);
    if (car) {
      setChatTargetCar(car);
      setIsChatVisible(true);
    } else {
      // open generic chat
      setIsChatVisible(true);
    }
  } else {
    setIsChatVisible(false);
    setChatTargetCar(null);
  }
}, [searchParams, cars]);


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

const handleLoginSuccess = (userData) => {
  setCurrentUser(userData);
  setIsLoginVisible(false);
  const params = new URLSearchParams(searchParams);
  params.delete('auth');
  setSearchParams(params, { replace: false });


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
  
  const params = new URLSearchParams(searchParams);
  params.delete('auth');
  setSearchParams(params, { replace: false });
  setIsLoginVisible(false);
  setCurrentUser(null);
  setCartItems([])
}

const handleToggleComments = (event, carId) => {
  event.preventDefault();
  event.stopPropagation();
  const sCarId = String(carId);
  setCommentSectionCarIds(prev => {
    const exists = prev.includes(sCarId);
    const next = exists ? prev.filter(id => id !== sCarId) : [...prev, sCarId];
    return next;
  });

  toggleCsvParam('comments', sCarId, { replace: true });
  setTopCarId(carId)
};


const toggleNotificationVisibility = () => {
  setIsNotificationVisible(!isNotificationVisible);
};

const handleCustomCarHome = () => {
  const params = new URLSearchParams(searchParams);
  params.set('customCar', 'true');
  setSearchParams(params, { replace: false });
  setCustomCarBuble(false);
}

const handleUseLoggedIn = () => {
  const params = new URLSearchParams(searchParams);
  if (searchParams.get('auth') === 'true') {
      params.delete('auth');
      setIsLoginVisible(false);
  } else {
    params.set('auth', 'true');
  }
  setSearchParams(params, { replace: false });
}

const handleBrand = () => {
  const params = new URLSearchParams(searchParams);
  params.set('brand', 'true');
  setSearchParams(params, { replace: false });
  setIsFilterCarBrandVisible(prev => !prev)
}

const sortedCars = [...filtercar].sort((a, b) => {
  if (topCarId === a.id) {
    return -1;
  } else if (topCarId === b.id) {
    return 1;
  } else {
    return 0;
  }
})


const parseCsvParam = (key) => {
  const val = searchParams.get(key);
  if (!val) return [];
  return val.split(',').filter(Boolean); // returns array of strings
};

const setCsvParam = (key, arr, { replace = true } = {}) => {
  const params = new URLSearchParams(searchParams);
  if (arr && arr.length) params.set(key, arr.join(','));
  else params.delete(key);
  setSearchParams(params, { replace });
};

const toggleCsvParam = (key, id, { replace = true } = {}) => {
  const arr = parseCsvParam(key);
  const sId = String(id);
  const exists = arr.includes(sId);
  const newArr = exists ? arr.filter(x => x !== sId) : [...arr, sId];
  setCsvParam(key, newArr, { replace });
  return !exists;
}
useEffect(() => {
  const customCarParam = searchParams.get('customCar');
  setIsCustomCarHomeVisible(customCarParam === 'true');
}, [searchParams]);

const closeCustomHome = () => {
  const params = new URLSearchParams(searchParams);
  params.delete('customCar');
  setSearchParams(params, { replace: false });
  setCustomCarBuble(false);
};

useEffect(() => {
  const loginParam = searchParams.get('auth');
 //setIsLoginVisible(loginParam === 'true');
  setIsLoggedIn(loginParam === 'true');
}, [searchParams]);


useEffect(() => {
  const customCarParam = searchParams.get('customCar');
  setIsCustomCarHomeVisible(customCarParam === 'true');
  setCustomCarBuble(false);
}, [searchParams]);

  useEffect(() => {
  const ids = parseCsvParam('comments');
  setCommentSectionCarIds(ids);
}, [searchParams]);

const handleNewMessage = useCallback(() => {
  console.log('onNewMessage callback triggered!');
  setUnreadMessagesCount(prev => prev + 1);
}, []); // Empty dependency array ensures this function is created only once.



return (
  <div>
  <div className={style.contentToBeFixed}>
    <div className={style.title}>

      <h1 className={style.titletext}><strong>ROAD KING MOTOR</strong></h1>
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
  <div className= {style.navbarbutton}>
      <button className={style.accountButton}
      onClick={handleUseLoggedIn}>
        <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-account-24.png"/>
      <span>Account</span></button>
      
      {isLoggedIn &&
        <div className={style.authFormContainer}>
      {currentUser ?(
        <div className={style.loggedIn}>
          <button className={style.closebutton}
          onClick={handleUseLoggedIn}>Close</button>
          <span className={style.welcomeMessage}>{currentUser.userName}!</span>
          <button onClick={handleLogout} className={style.topButton}>Logout</button>
        </div>
      ): (
        <div className={style.authFormContainer}>
          <button onClick={handleUseLoggedIn}
          className={style.closebutton}>Close</button>
          <AuthForm onLoginSuccess={handleLoginSuccess}
          onClose={handleUseLoggedIn} />
            </div>
      )}
      </div>
          }
{/*
 <button className = {style.navbuttonaddtocart} onClick={handleToggleCarVisibility}>
   <img className = {style.topButton} src ="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-add-to-cart-48.png"
    alt="addtocart"/> </button>

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
  <button onClick={() => handleOpenChat(null)}
  className={style.accountButton}>
    <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-24.png" alt="chat" />
  <span>Chat</span>
    {unreadMessagesCount > 0 && (
    <span className={style.notificationBadge}>
      {unreadMessagesCount}
    </span>
      )}
  </button>
    ) : (
      <button onClick={handleCloseChat}>
    <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-chat-24.png" alt="chat" />
  <span>Chat</span>
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

  {/*isLoginVisible && !currentUser && (
    <div className={style.authFormContainer}>
      <button onClick={handleUseLoggedIn} className={style.closebutton}>
        Close
      </button>
      <AuthForm onLoginSuccess={handleLoginSuccess} onClose={handleUseLoggedIn} />
    </div>
  )
  */}
  <div className={style.secondTitlePhone}>
    <button onClick={handleBrand}>Brand</button>
    {isFilterCarBrandVisible && (
        <div id="filter-menu" className={style.brandPone}>
        <button className={style.navbuttonphone} onClick={() => { 
          setShowAll('');
          setIsFilterMenuOpen(false);
          handleBrand();
        }}>
        <strong>Show All cars</strong>
        </button>
        {uniqueCarNames.map((brand) => (
          <button key={brand}
            className={style.navbuttonphone}
            onClick={() => {
              setShowAll(brand);
              setIsFilterMenuOpen(false);
              handleBrand();
            }}>
            {brand}
          </button>
        ))}
      </div>
    )}
<div>
  <select
  className={style.buttonCarCondition}
  onChange={(e) => setConditionFilter(e.target.value)}
  defaultValue=''
  >
    <option value="" disabled>Condition</option>
      <option value='New'>New Cars</option>
      <option value='Used'>Used Cars</option>
      </select>
      </div>
      
      <button className={style.buttonCarCondition}>
    Pending
        </button>
      <button
      className={style.customCarButton}
      onClick={handleCustomCarHome}>
      {customCarBuble && (
        <span className={style.customCarButtonIcon}></span>)}Customise your Car
        </button>
</div>

    <div className={style.filterContainer}>
      <button className={style.buttonCarCondition}
      onClick={() => setConditionFilter('New')}> 
        <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-new-16.png"/>New Cars
        </button>
        
      <button className={style.buttonCarCondition}
      onClick={() => setConditionFilter('Used')}>

        <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-car-16.png"/>Used Cars
      </button>

      <button className={style.buttonCarCondition}>
        <img src="https://roadkingmoor.s3.eu-north-1.amazonaws.com/icons8-pending-16.png"/>Pending Cars
        </button>
      <button
      className={style.customCarButton}
      onClick={handleCustomCarHome}>
        {customCarBuble && (
        <span className={style.customCarButtonIcon}></span>)}Customise your Car
      </button>
      </div>
    </div>

    <div className={style.cardAndFilter}>
      <div className={style.sidePanel}>
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
            {brand}
          </button>
        ))}
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
      )}

        const currentImageIndex = currentImageIndices[car.id] || 0; 
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
      onClick={() => {
      setSelectedCar(car);
      //navigate(`?car=${car.id}&model=${car.model}`)
      const params = new URLSearchParams(searchParams);
      params.set('car', car.id);
      params.set('model', car.model);
      setSearchParams(params, { replace: false });
    }}
    

        style={firstImageUrlForBackground ? {
        //backgroundImage: `url(${firstImageUrlForBackground})`,
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
  <div className={style.carproperty}>

  year: <span>{car.year}</span>
  
  </div>
    <div className={style.otherDescription}>
      <div className={style.carpropartyp}><h3></h3>{car.otherDescription}</div>
      </div>
 </div>
    {isExpanded && (
      <div className={style.carpropartyDetails}>
    <div className={style.carproperty}>Brand: <span>{car.brand}</span> </div>
    <div className={style.carproperty}>Made in: <span>{car.madeIn}</span></div>
    <div className={style.carproperty}>Mileage: <span>{car.mileage}</span>km</div>
    <div className={style.carproperty}>Fuel Type: <span>{car.fuelType}</span></div>
    <div className={style.carproperty}>Car body: <span>{car.bodyType}</span></div>
    <div className={style.carproperty}>Transmission: <span>{car.transmission}</span></div>
    <div className={style.carproperty}>Color: <span>{car.color}</span></div>
    <div className={style.carproperty}>Seats: <span>{car.seats}</span></div>
    <div className={style.carproperty}>Doors: <span>{car.doors}</span></div>
    <div className={style.carproperty}>Engine Size: <span>{car.engineSize}</span></div>
    <div className={style.carproperty}>Status: <span>{car.status}</span></div>
    <div className={style.carproperty}>Created At: <span>{car.createdAt}</span></div>
    
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
<button className={style.button} onClick={(event) =>{
  event.preventDefault()
  event.stopPropagation()
  handleOpenChat(car); }}>Chat</button>


  <button className={`${style.hideAndShowButton}`}
 onClick={(event) => handleToggleComments(event, car.id)}>
{commentSectionCarIds.includes(car.id) ? 'Hide Comments' : 'Comments'}
</button>

</div>
<div className={`${style.comment} ${commentSectionCarIds.includes(car.id) ? `${style.absolute} ${style.otherStyle}` : style.static}`}>
 <AverageRating carId={car.id} refresh={refresh} />
 {commentSectionCarIds.includes(String (car.id)) && (
  
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
        onNewMessage={handleNewMessage}
        messages={messages}
        setMessages={setMessages}
        socket={socketRef.current}


        unreadMessagesCount={unreadMessagesCount}
        setUnreadMessagesCount={setUnreadMessagesCount}
        />
      </div>
    )}

    </div>

              {isCustomCarHomeVisible && (
                <div className={style.customCarContainer}>
                <CustomCarHome onClose={closeCustomHome}
                customCars={customCars}
                setCustomCars={setCustomCars}
                setCustomCarBuble={setCustomCarBuble} />
                </div>
              )}
              
{isAddToCartButtonVisible && (
  <div className={style.cartContainer}>
    <Addtocart cartItems={cartItems} onClose={closeAddToCartContent} />
  </div>
)}
  
  </div>
  </div>
  <Footer />
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