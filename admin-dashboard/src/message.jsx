
import { useState, useEffect, useRef } from 'react';
import messageAct from './messageAxios.js';
import userAct from './userAxios.js'
import io from 'socket.io-client';
import style from './module/messageStyle.module.css'

const Message = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [adminUser, setAdminUser] = useState(null)
  const userId = adminUser?.id;
  const [selectedUserToReply, setSelectedUserToReply] = useState(null);
  const ADMIN_USERNAME = 'Road King Motor Support'
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const socket = useRef(null)

const processUserObject = (userObj) => {
  if (userObj && typeof userObj === 'object' && typeof userObj.id !=='undefined' && typeof userObj._id === 'undefined') {
    return {...userObj, _id: userObj.id }
  }
  return userObj;
}

useEffect(() => {
  let isMountedAdminFetch = true;

  const fetchAdminDetails = async () => {
    try {
      const rawAdmin = await userAct.getUserByUserName(ADMIN_USERNAME)
      const admin = processUserObject(rawAdmin);
      if (isMountedAdminFetch) {
        if (admin && admin._id) {
          setAdminUser(admin);
          setError(null);
        } else {
          setError(`Admin user "${ADMIN_USERNAME}" not found. Chat cannot be initiated.`);
        }
      }
    } catch (err) {
      console.error("Error fetching admin user details:", err);
      if (isMountedAdminFetch) {
        setError("Failed to initialize admin user. Chat may not function correctly.");
      }
    }
  };

  const fetchInitialMessages = async () => {
    try {
      const rawMessages = await messageAct.getMessage();
      if (Array.isArray(rawMessages)) {
        const processedMessages = rawMessages.map(msg => {
          const processedSender = processUserObject(msg.sender)
          return {...msg, sender: processedSender}
        })
        setMessages(processedMessages);
        setError(null);
      } else {
        console.error("Expected array from backend, got:", rawMessages);
        setMessages([]);
        setError("Failed to load messages.");
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages. Please try again later.");
      setMessages([]);
    }
  };

  fetchAdminDetails();
  fetchInitialMessages();

  return () => {
    isMountedAdminFetch = false;
  };
}, []);

const token ='admin';
const userName='Road King Motor Support';

useEffect(() => {
  console.log('useEffect started', Date.now())
   const socketUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const newSocket = io(socketUrl, {
    auth: {
      token: token,
      userId: adminUser?._id,
      userName: userName,
    },
      withCredentials: true,
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000
  });
  socket.current = newSocket;

newSocket.on('connect', () => {
  console.log('Socket connected', userId);
  setIsSocketConnected(true);
});

newSocket.on('connect_error', (error) => {
  console.error('Socket connction error:', error);
  setIsSocketConnected(false);
});

newSocket.on('disconnect', () => {
  console.log('Socket disconnected', socket.id);
  setIsSocketConnected(false);
});

newSocket.on('reconnect_attempt', (attempt) => {
  console.error('Attemptin to reconnect....', attempt);
  setSocketStatus('error');
})

newSocket.on('reconnect_failed', () => {
  console.error('Failed to reconnect to webSocket server after multiple attempts.');
  setSocketStatus('disconneted')
})

newSocket.on('receiveMessage', (message) => {
  console.log('Message received:', message, 'Timestamp:', Date.now());
  setMessages(prevMessages => {
    const processedMessage = {
    ...message,
    sender: processUserObject(message.sender),
    receiver: processUserObject(message.receiver),
  };
    return [...prevMessages, processedMessage]
  
  });
});

return () => {
  newSocket.off('connect');
  newSocket.off('receiveMessage');
  newSocket.off('connect_error');
  newSocket.off('disconnect');
  newSocket.off('reconnect_attempt');
  newSocket.off('reconnect_failed');
  newSocket.close();
  console.log('UseEffect cleanup', Date.now());
};
}, [adminUser?._id, userId])

  const sendMessage = async () => {
    if (!input.trim()) {
      setError('Message cannot be empty.');
      return;
    }

    if (!adminUser || !adminUser._id) {
      setError('Admin user not identified. Cannot send message.')
      return;
    }

    if (!selectedUserToReply || !selectedUserToReply._id) {
      setError('Please select a user to reply to.')
      return;
    }

    const messagePayload = {
      sender: adminUser._id,
      receiver: selectedUserToReply._id,
      content: input,
    };

    try {
      socket.current.emit('sendMessage', messagePayload);
      setInput('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send message.';
      console.error("Error sending message:", error);
      setError(errorMessage);
    }
  };

return (
  <div className="message-container">

    <div className={style.chatTitle}>
      <h5 style={{ margin: 0, fontWeight: 'bold' }}>
        {adminUser ? `${adminUser.userName} - Admin Chat` : 'Admin Chat Loading...'}
      </h5>
      {onClose && (
        <button className={style.closeChat}
          onClick={onClose}
          aria-label="Close chat"
        >
          &times;
        </button>
      )}

          {selectedUserToReply && (
      <div className={style.selectedReceiver}>
        <span>Replying to: <strong>{selectedUserToReply.userName}</strong></span>
        <button
          onClick={() => setSelectedUserToReply(null)}
          className={style.clearButton}>
          Clear
        </button>
      </div>
    )}

    </div>

  
    {error && (
      <p className={style.error}>
        {error}
      </p>
    )}
    {socketStatus === 'error' && <p className={style.error}>Failed to conect to chat servive.</p>}


    <div className={style.messageList} >
      {messages.length === 0 && !error && (
        <p className={style.noMessage}>No messages yet.</p>
      )}
      {messages.map((msg, index) => {

const isSentByAdmin =
  adminUser &&
  msg.sender &&
  typeof msg.sender === 'object' &&
  msg.sender._id &&
  adminUser._id &&
  msg.sender._id.toString() === adminUser._id.toString();

const canReplyTo = msg.sender && typeof msg.sender === 'object' && msg.sender._id;
const senderDisplayName = canReplyTo ? (msg.sender.userName || `User (${msg.sender._id.slice(0, 6)})`): 'Unknown User';


        return (
          <div
          key={msg._id || `msg-${index}-${msg.sender?._id}-${msg.createdAt}`}
            className={style.messageSender}
             style={{alignItems: isSentByAdmin ? 'flex-end' : 'flex-start',}}>
            <div className={style.message} style={{
              backgroundColor: isSentByAdmin ? '#dcf8c6' : '#e9e9eb',
            }}>

                {!isSentByAdmin && canReplyTo ? (
                    <strong className={style.userName}
                  onClick={() =>
                    setSelectedUserToReply({
                      _id: msg.sender._id,
                      userName: msg.sender.userName || msg.sender._id
                    })
                  }
                  title={senderDisplayName}>
 
 {senderDisplayName}
                </strong>
                  
              ):( 
                <strong
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#6c757d',
                    fontSize: '0.9em',
                  }}
                 
                 title={typeof msg.sender === 'string' ? `User ID: ${msg.sender}` : senderDisplayName}
                 >
                </strong>
              )
            }
              {isSentByAdmin && (
                <strong
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#007bff',
                    fontSize: '0.9em'
                  }}
                >
                  {adminUser.userName}(you)
                </strong>
              )}
              <div>{msg.content}</div>
              <small style={{
                display: 'block',
                marginTop: '5px',
                fontSize: '0.75em',
                color: '#666',
                textAlign: 'right'
              }}>
                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ''}
              </small>
            </div>
          </div>
        );
      })}
    </div>

    
    <div className={style.messageFooter}>
      <textarea
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows="4"
        className={style.messageInput}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      <button
        onClick={sendMessage}
        disabled={!input.trim() || !selectedUserToReply}
        className={style.sendButton}
        aria-label="Send message"
      >
        Send
      </button>
    </div>
  </div>
)
}

export default Message
