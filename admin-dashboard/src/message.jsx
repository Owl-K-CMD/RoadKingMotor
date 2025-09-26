import { useState, useEffect, useRef } from 'react';
import messageAct from './messageAxios.js';
import userAct from './userAxios.js';
import style from './module/messageStyle.module.css'

const Message = ({ onClose, messages, setMessages, socket }) => {
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [adminUser, setAdminUser] = useState(null)
  const [selectedUserToReply, setSelectedUserToReply] = useState(null);
  const ADMIN_USERNAME = 'Road King Motor Support'


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
      console.log('Message Admin:', admin)
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
}, [setMessages]);

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

    //const messagePayload = {
      //sender: adminUser._id,
      //receiver: selectedUserToReply._id,
      //content: input,
    //};

    const messagePayload = {
  sender: adminUser._id,
  senderModel: 'AdminUser',
  receiver: selectedUserToReply._id,
  receiverModel: 'User',
  content: input,
}; 

    try {
      // Emit the message via socket. The backend will save it and broadcast it back.
      socket.emit('sendMessage', messagePayload);

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
        {adminUser ? `${adminUser.name} - Admin Chat` : 'Admin Chat Loading...'}
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
                  {adminUser.name}(you)
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