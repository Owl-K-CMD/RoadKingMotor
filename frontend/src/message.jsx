import { useEffect, useState, useRef } from 'react';
import messageAct from './messageAxios';
import userAct from './userAxios.js';
import style from './module/styleMessage.module.css';



const Message = ({ targetName, onClose, messages, setMessages, socket }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [user, setUser] = useState(null);
  const [supportUser, setSupportUser] = useState(null)


  const messagesEndRef = useRef(null);

  const processUserObject = (userObj) => {
  if (userObj && typeof userObj === 'object' && typeof userObj.id !=='undefined' && typeof userObj._id === 'undefined') {
    return {...userObj, _id: userObj.id }
  }
  return userObj;
}

useEffect(() => {
  const token = localStorage.getItem('authToken');
  const storedUser = localStorage.getItem('currentUser');

  if (token && storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      const processedUser = processUserObject(parsedUser);
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

useEffect(() => {
  let isMounted = true;
  const fetchSupportUser = async () => {
    try {
      const rawSupportUser = await userAct.getUserByUserName(targetName);
      const processedSupportUser = processUserObject(rawSupportUser);
      if (isMounted && processedSupportUser?._id) {
        setSupportUser(processedSupportUser);
      } else if (isMounted) {
        setError(`Support user "${targetName}" not found.`);
      }
    } catch (error) {
      console.error("Error fetching support user:", error);
      if (isMounted) setError("Failed to load support user details.");
    }
  };
  if (targetName) {
    fetchSupportUser();
  }
  return () => { isMounted = false; };
}, []);


const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
};

useEffect(() => {
  scrollToBottom();
}, [messages])



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
  sender: user.id,
  senderModel: 'User',
  receiver: supportUser.id,
  receiverModel: 'AdminUser',
  content: input,
};
  
    try {
      // The server will save the message and broadcast it back to us.
      socket.emit('sendMessage', messagePayload);
      setInput("");
      setError(null);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = 'Failed to send message. Please try again.';
      setError(errorMessage);
    }
  };


 const filteredMessages = messages.filter((msg) => {
        const senderId = msg.sender && msg.sender._id ? msg.sender._id.toString() : null;
        const receiverId = msg.receiver && msg.receiver._id ? msg.receiver._id.toString() : null;
        const currentUserId = user && user._id ? user._id.toString() : null;
        const supportUserId = supportUser && supportUser._id ? supportUser._id.toString() : null;

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
      <h4 className={style.chatTitlesmall}><strong>{supportUser ? `Chat with ${supportUser.name}` : (targetName ? `Connecting to ${targetName}...` : 'Chat support')}</strong></h4>


      {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      {nameConfirmed && (
        <div>
          <div className={style.message} >
            {filteredMessages.length === 0 ? (
              <p>No messages yet. Start the conversation!</p>
            ) : (
              filteredMessages.map((msg, index) => {

                const isSenderSelf = msg.sender && msg.sender._id === user._id;

                
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
                    {isSenderSelf ? 'You' : targetName}
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

            <button className={style.sendButton} 
            onClick={sendMessage} disabled={!input.trim() || !user || !supportUser}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;