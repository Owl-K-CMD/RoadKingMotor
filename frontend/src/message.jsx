import { useEffect, useState, useRef } from 'react';
import messageAct from './messageAxios';
import userAct from './userAxios.js';
import style from './module/styleMessage.module.css';
import io from 'socket.io-client';


const Message = ({ targetName, onClose, onNewMessage}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [user, setUser] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [supportUser, setSupportUser] = useState(null)
  const [tokenReady, setTokenReady] = useState(false);
  const [socketStatus, setSocketStatus] = useState('connecting');
  
  const socket = useRef(null);
  const messagesEndRef = useRef(null);

  const processUserObject = (userObj) => {
  if (userObj && typeof userObj === 'object' && typeof userObj.id !=='undefined' && typeof userObj._id === 'undefined') {
    return {...userObj, _id: userObj.id }
  }
  return userObj;
}


  const processedUserResponse = (userData) => {
    if (userData && typeof userData === 'object' && typeof userData.id !== 'undefined' && typeof userData._id === 'undefined') {
      return {...userData, _id: userData.id}
    }
    return userData;
  }

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setTokenReady(true);
    }
  }, []);

useEffect(() => {
  const token = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('currentUser');

  if (token && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const processedUser = processedUserResponse(parsedUser);
      if (processedUser && processedUser.id) {
        setUser(processedUser);
        setNameConfirmed(true);
        setError(null)
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
    }
  }
  
}, [])

const processUserResponse = (userData) => {
 if (userData && typeof userData === 'object' && typeof userData.id !== 'undefined' && typeof userData._id === 'undefined') {
    return { ...userData, _id: userData.id }
  }
  return userData;
}

useEffect(() => {
  if (targetName && nameConfirmed && user && user._id && tokenReady) {
    let isMounted = true;

    const fetchSupportUserDetails = async () => {
      try {
        const rawSupport = await userAct.getUserByUserName(targetName);
        const processedSupport = processUserResponse(rawSupport);

        if (isMounted && processedSupport && processedSupport._id) {
          setSupportUser(processedSupport);
          setError(null);
          console.log("Support user details:", processedSupport);

          try {
            const rawMessages = await messageAct.getAllMessages();
            if (isMounted) {
              if (Array.isArray(rawMessages)) {
                const processedMessages = rawMessages.map((msg) => ({
                  ...msg,
                  sender: processUserResponse(msg.sender),
                  receiver: processUserResponse(msg.receiver),
                }));
                setMessages(processedMessages);
              } else {
                console.error("Expected array from backend for messages, got:", rawMessages);
                setMessages([]);
                setError("Failed to load messages history. Please try again.");
              }
            }
          } catch (error) {
            console.error("Error fetching messages:", error);
            if (isMounted) setError("Failed to fetch messages history.");
          }
        } else {
          console.error(`Support user "${targetName}" not found.`);
          setSupportUser(null);
          setError(`Support user "${targetName}" not found.`);
        }
      } catch (error) {
        if (error.response.status === 404) {
          console.error(`Support user "${targetName}" not found`);
          setError(`Support user not found`);
          setSupportUser(null);
        } else {
        console.error(`Error fetching support user ${targetName}:`, error);
        if (isMounted) setError(`Could not retrieve details for ${targetName}.`);
        setSupportUser(null);
      }
    }
    };

    fetchSupportUserDetails();

      const token = localStorage.getItem('authToken');

    const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: {
        userId: user._id,
        token: token,
      },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    socket.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server', socketUrl);
      setSocketStatus('connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setSocketStatus('error');
    });


    newSocket.on('reconnect_attempt', (attempt) => {
      console.log("Attempting to reconnect....", attempt);
      setSocketStatus('connecting');
    })

    newSocket.on('reconnect_failed', () => {
      console.log('Failed to reconnect to webSocket server after multiple attemps');
      setSocketStatus('disconnected');
      setError('Chat is temporarily unavailable. Please try again later')
    })

    newSocket.on('receiveMessage', (message) => {
      console.log('Received message via Socket.IO:', message);

      const receivedMessage = message.type === 'newMessage' ? message.message : message;


      const processedMessage = {
      ...receivedMessage,
      sender: processUserObject(message.sender),
      receiver: processUserObject(message.receiver),
    };
  
      // Log the processed message to check its structure
      console.log('Processed message:', processedMessage);

      // Log the targetName and sender's userName for debugging
      console.log('targetName:', targetName, 'Sender userName:', processedMessage.sender.userName);

      setMessages(prevMessages => [...prevMessages, processedMessage]);
      if(processedMessage.sender && processedMessage.sender.userName === targetName) {
        console.log('New message from support user, triggering onNewMessage',{ 
        processedMessageSender : processedMessage.sender ? processedMessage.sender.userName: 'Unknown Sender',
        supportUserName : targetName
      })
        onNewMessage()
      } else {
        console.log('New message, but not from support user', { processedMessage })
      }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server', reason);
    });

    return () => {
      isMounted = false;
      newSocket.off('connect');
      newSocket.off('receiveMessage');
      newSocket.off('disconnect');
      newSocket.off('reconnect_attempt');
      newSocket.off('reconnect_failed');
      newSocket.close();
    };
  } else {
    setMessages([]);
    setSupportUser(null);
  }
}, [targetName, nameConfirmed, user, user?._id, tokenReady, onNewMessage]);


const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
};

useEffect(() => {
  scrollToBottom();
}, [messages])


  const handleUserLookupAndProceed = async () => {
    if (!userName.trim()) {
      setError('Please enter your username.');
      return;
    }

    try { 

const rawExistingUser = await userAct.getUserByUserName(userName);
      const existingUser = processUserResponse(rawExistingUser);

      if (existingUser && existingUser._id) {
        setUser(existingUser);
        setNameConfirmed(true)
        setShowRegistrationForm(false)
        setError(null)
      } 

      else {
        console.error('User lookup returned incomplete data or null:', existingUser)
        setError('User is incomplete or user not found. Please register to chat.')
        setShowRegistrationForm(true)
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setNewUserName(userName);
        setShowRegistrationForm(true);
        setError('User not found. Please register to chat.')
      } else {
        console.error('Lookup error:', error);
        setError('Server error. Please try again.');
        console.error('User lookup error:', error)
        let displayMessage = 'An unexpected error occurred during user lookup. Please try again.';
        if (error.response) {
          console.error('Server response data:', error.response.data)
          displayMessage = error.response.data?.error || error.response.data?.message  || `Error:${error.message}`;

        } else if (error.request) {
        displayMessage= 'No response from server. Please check your network'
        }
        setError(displayMessage);
      }
    }
  };


  const createUser = async (e) => {
    e.preventDefault();

    if (!newUserName || !newName || !newPhoneNumber || !newPassword) {
      setError('All fields are required.');
      return;
    }

    const newUser = {
      userName: newUserName,
      name: newName,
      phoneNumber: newPhoneNumber,
      password: newPassword,
    };

    try {

      const rawRegistered = await userAct.createUser(newUser);
      const registered = processUserResponse(rawRegistered);

            if (registered && registered._id) {
        setUser(registered);
        setUserName(registered.userName);
        setNameConfirmed(true);
        setShowRegistrationForm(false);
        setNewUserName('');
        setNewName('');
        setNewPhoneNumber('');
        setNewPassword('');
        setError(null);
      } else {
        console.error('Registration returned incomplete data or null:', registered);
        setError('Registration completed, but user data is incomplete. Please try logging in or contact support.');
      }
    } catch (error) {
      setError('Registration failed. Try again.', error);
      console.error('Registration error:', error)
      let displayMessage = 'Failed to send message. Please try again'
      if (error.response?.data?.error) {
        displayMessage = error.response.data.message
      } else if (error.response?.data?.message) {
      displayMessage = error.response.data.message
      }
      setError(displayMessage)
    }
  };

  const sendMessage = async () => {

      if (!input.trim()) {
        setError('Message cannot be empty.')
        return
      }
      if (!user || !user._id) {
        setError('User not identified. Please verify your username.')
        return
      }
      if (!supportUser || !supportUser._id) {
        setError(`Recipient ${targetName || 'support'} not identified. Cannot send message.`)
        return;
      }

    const messagePayload = {
      sender: user._id,
      receiver: supportUser._id,
      content: input,
    };

    try {
      setError(null);

      await messageAct.createMessage(messagePayload)
      
      socket.current.emit('sendMessage', messagePayload);
      
      setInput('');
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send message.';
      setError(errorMessage);
    }
  };


 const filteredMessages = messages.filter((msg) => {
        const senderId = msg.sender && msg.sender._id ? msg.sender._id.toString() : null;
        const receiverId = msg.receiver && msg.receiver._id ? msg.receiver._id.toString() : null;
        const currentUserId = user && user._id ? user._id.toString() : null;
        const supportUserId = supportUser && supportUser._id ? supportUser._id.toString() : null;
/*
        if (!senderId || !receiverId || !currentUserId || !supportUserId ) {
          
          console.log("msg.sender", msg.sender)
          console.log("msg.receiver", msg.receiver)
          console.log("Filtering skipped due to missing info:", {
          senderId, receiverId, currentUserId, supportUserId, msg
        });

          return false;
      }
*/
            const isFromCurrentUserToSupport = (senderId === currentUserId && receiverId === supportUserId);
      const isFromSupportToCurrentUser = (senderId === supportUserId && receiverId === currentUserId);

      const isRelevant = isFromCurrentUserToSupport || isFromSupportToCurrentUser;

      if (!isRelevant) {
        //console.log("Filtered out irrelevant message:", msg);
      }

      return isRelevant;
    }); 


  return (
    <div style={{
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    }} className={style.messageContainer}>
      <div className={style.chatHeader}>
              {onClose && <button className={style.closebutton} onClick={onClose}>Close</button>}
      <h3 className={style.chatTitle}><strong>Chat Support</strong></h3>
      <h4 className={style.chatTitlesmall}><strong>{supportUser ? `Chat with ${supportUser.userName}` : (targetName ? `Connecting to ${targetName}...` : 'Chat support')}</strong></h4>


      {error && <p style={{ color: 'red' }}>{error}</p>}
      {socketStatus === 'error' && <p style={{ color: 'red' }}>Failed to connect to chat service. Please try again later.</p>}
      </div>
      {/*
      {!nameConfirmed && (
        <>
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Enter your username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyPress = {(e) => {
                if (e.key === 'Enter') {
                  handleUserLookupAndProceed();
                }
              }}
            />
            <button onClick={handleUserLookupAndProceed} disabled={!userName.trim()}>Start Chat</button>
          </div>

          {showRegistrationForm && (
            <form onSubmit={createUser} style={{ marginTop: '10px' }}>
              <p>User not found. Please register to chat.</p>
              <input
                type="text"
                placeholder="Username"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Full Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button type="submit">Register & Chat</button>
              <button type="button" onClick={() => setShowRegistrationForm(false)}>Cancel</button>
            </form>
          )}
        </>
      )}
*/}
      {nameConfirmed && (
        <div>
          <div className={style.message} >
            {filteredMessages.length === 0 ? (
              <p>No messages yet. Start the conversation!</p>
            ) : (
              filteredMessages.map((msg, index) => {

                const isSenderSelf = msg.sender && msg.sender._id === user._id;
                const senderName = msg.sender && msg.sender.userName ? msg.sender.userName : 'Unknown user'
                
                return (<div 
                key={msg.id || `msg-${index}-${msg.sender?._id}-${msg.createdAt}`}
                 style={{
                  display: 'flex',
                  justifyContent: isSenderSelf ? 'flex-end' : 'flex-start',
                  margin: '8px 0',
                  borderRadius: '8px',
                  wordBreak: 'break-word',
                }}>
                    <div style={{
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                    }}>
              
                  <strong style={{ display: 'block', marginBottom: '4px', color: isSenderSelf ? '#007bff' : '#333', fontSize: '0.9em' }}>
                    {isSenderSelf ? 'You' : senderName}
                    </strong>
                  <div>{msg.content}</div>
                  <small style={{ display: 'block', marginTop: '5px', fontSize: '0.75em', color: '#666', textAlign: 'right' }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </small>
                </div>
                </div>
               ) })
            )}
            <div ref={messagesEndRef} />
          
          </div>

          <div className={style.messageInput}>
            <textarea
            className={style.messageInput}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows="3"
                            onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button className={style.sendButton} onClick={sendMessage} disabled={!input.trim() || !user || !supportUser}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;