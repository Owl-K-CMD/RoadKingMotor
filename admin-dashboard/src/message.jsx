
import { useState, useEffect } from 'react';
import messageAct from './messageAxios.js';
import userAct from './userAxios.js'

const Message = ({ targetName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [input, setInput] = useState('');
  const [adminUser, setAdminUser] = useState(null)
  const [selectedUserToReply, setSelectedUserToReply] = useState(null)
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

// Second useEffect: Start polling only after adminUser is loaded
useEffect(() => {
  if (!adminUser) return;

  let isMountedMessagesFetch = true;

  const fetchMessages = async () => {
    try {
      const rawFetchedMessages = await messageAct.getMessage();
      console.log("Fetched Messages:", rawFetchedMessages);

      if (isMountedMessagesFetch) {
        if (Array.isArray(rawFetchedMessages)) {
          const processedFetchedMessages = rawFetchedMessages.map(msg => {
            const processedSender = processUserObject(msg.sender)
            return {...msg, sender: processedSender }
          })
          setMessages(processedFetchedMessages);
          setError(null);
        } else {
          console.error("Expected array from backend, got:", rawFetchedMessages);
          setMessages([]);
          setError("Failed to load messages.");
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (isMountedMessagesFetch) {
        setError("Failed to fetch messages. Please try again later.");
        setMessages([]);
      }
    }
  };

  fetchMessages(); // Initial poll
  const intervalId = setInterval(fetchMessages, 5000); // Poll every 5s

  return () => {
    isMountedMessagesFetch = false;
    clearInterval(intervalId);
  };
}, [adminUser]);


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

    //if (selectedUserToReply) {
      //messagePayload.receiver = selectedUserToReply;
    //}

    try {
      setError(null);
      const savedMessage = await messageAct.createMessage(messagePayload);
      setMessages(prev => [...prev, savedMessage]);
      setInput('');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to send message.';
      console.error("Error sending message:", error); // Keep console error for debugging
      setError(errorMessage);
    }
  };

return (
  <div className="message-container">

    <div style={{
      padding: '10px 15px',
      borderBottom: '1px solid #e0e0e0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#f7f7f7'
    }}>
      <h5 style={{ margin: 0, fontWeight: 'bold' }}>
        {adminUser ? `${adminUser.userName} - Admin Chat` : 'Admin Chat Loading...'}
      </h5>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
          aria-label="Close chat"
        >
          &times;
        </button>
      )}
    </div>

    {/* Error Display */}
    {error && (
      <p style={{
        color: 'red',
        padding: '10px',
        margin: 0,
        backgroundColor: '#ffebee',
        textAlign: 'center'
      }}>
        {error}
      </p>
    )}

    {/* Selected User to Reply */}
    {selectedUserToReply && (
      <div style={{
        padding: '8px 15px',
        backgroundColor: '#e6f7ff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.9em'
      }}>
        <span>Replying to: <strong>{selectedUserToReply.userName}</strong></span>
        <button
          onClick={() => setSelectedUserToReply(null)}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            padding: '2px 8px'
          }}
        >
          Clear
        </button>
      </div>
    )}

    {/* Message List */}
    <div className="message-list" style={{
      flexGrow: 1,
      overflowY: 'auto',
      padding: '10px',
      backgroundColor: '#fafafa'
    }}>
      {messages.length === 0 && !error && (
        <p style={{ textAlign: 'center', color: '#777' }}>No messages yet.</p>
      )}
      {messages.map((msg, index) => {

const isSentByAdmin =
  adminUser &&
  msg.sender &&
  typeof msg.sender === 'object' &&
  msg.sender._id &&
  adminUser._id &&
  msg.sender._id.toString() === adminUser._id.toString();


  const senderName = (msg.sender && typeof msg.sender === 'object' && msg.sender.userName)
          ? msg.sender.userName : 'Unknown User';

const canReplyTo = msg.sender && typeof msg.sender === 'object' && msg.sender._id;
const senderDisplayName = canReplyTo ? (msg.sender.userName || `User (${msg.sender._id.slice(0, 6)})`): 'Unknown User';


        return (
          <div
          key={msg._id || `msg-${index}-${msg.sender?._id}-${msg.createdAt}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isSentByAdmin ? 'flex-end' : 'flex-start',
              margin: '8px 0',
            }}
          >
            <div style={{
              backgroundColor: isSentByAdmin ? '#dcf8c6' : '#e9e9eb',
              padding: '10px 14px',
              borderRadius: '15px',
              maxWidth: '70%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              wordBreak: 'break-word',
            }}>
         {/*
                {!isSentByAdmin && msg.sender && (
                  (msg.sender && typeof msg.sender === 'object' && msg.sender._id && msg.sender.userName) ? (
           */}
                {!isSentByAdmin && canReplyTo ? (
                    <strong
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#007bff',
                    fontSize: '0.9em',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onClick={() =>
                    setSelectedUserToReply({
                      _id: msg.sender._id,
                      userName: msg.sender.userName || msg.sender._id
                    })
                  }
                  //title={`Reply to ${msg.sender.userName}`}
                  title={senderDisplayName}

                >
 {/*{msg.sender.userName}*/}
 {senderDisplayName}
                  
                </strong>
                  
              ):( // Else part of the ternary: Sender not fully identified
                <strong
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    color: '#6c757d', // Indicate non-interactive or issue
                    fontSize: '0.9em',
                  }}
                 // title={senderName} // senderName will be "Unknown User" or similar
                 title={typeof msg.sender === 'string' ? `User ID: ${msg.sender}` : senderDisplayName}

                >
                {senderName} 
                  {/* {typeof msg.sender === 'string' ? `User ID: ${msg.sender.slice(0,6)}...` : senderDisplayName}*/}
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
                  {adminUser.userName} (you)
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

    {/* Input and Send */}
    <div style={{
      padding: '10px',
      borderTop: '1px solid #e0e0e0',
      display: 'flex',
      backgroundColor: '#f7f7f7'
    }}>
      <textarea
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows="2"
        style={{
          flexGrow: 1,
          resize: 'none',
          borderRadius: '16px',
          border: '1px solid #ccc',
          padding: '10px',
          outline: 'none',
          marginRight: '10px',
        }}
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
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Send
      </button>
    </div>
  </div>
)
}

export default Message
