
import messageAct from './messageAxios';
import { useEffect, useState } from 'react';

const Message = ({ targetName, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [senderName, setSenderName] = useState('');
  const [error, setError] = useState(null);
  const [nameConfirmed, setNameConfirmed] = useState(false);

  useEffect(() => {
    messageAct.getAllMessages()
      .then((initialMessages) => {
        if (Array.isArray(initialMessages)) {
          setMessages(initialMessages);
        } else {
          setError('Could not load messages correctly.');
          setMessages([]);
        }
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch messages. Please try again later.');
        setMessages([]);
      });
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !senderName.trim()) {
      setError('Please enter your name and message.');
      return;
    }

    const messagePayload = {
      sender: senderName,
      content: input,
    };

    try {
      setError(null);
      const savedMessage = await messageAct.createMessage(messagePayload);
      setMessages(prev => [...prev, savedMessage]);
      setInput('');
    } catch (err) {
      //const errorMessage = err.response?.data?.error || 'Failed to send message. Please try again later.';
     if(err.response) {
         console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        console.error('Error request:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
       const errorMessage = err.response?.data?.error || 'Failed to send message. Please try again later.';
      setError(errorMessage);
      //console.error(errorMessage)
    }
  };

  const handleNameSubmit = () => {
    if (!senderName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setNameConfirmed(true);
    setError(null);
  };

  // Filter messages by current user
  const filteredMessages = messages.filter(msg => msg.sender === senderName);

  return (
    <div>
      <h3>Chat Support</h3>
      <h4>{ targetName ? `Chat with ${targetName}` : 'Chat support'}</h4>

      {onClose && <button onClick={onClose}>Close</button>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!nameConfirmed ? (
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Enter your name to start chat"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
          <button onClick={handleNameSubmit}>Start Chat</button>
        </div>
      ) : (
        <>
          <div className="message-list" style={{ marginTop: '15px' }}>
            {filteredMessages.length === 0 && <p>No messages yet. Start the conversation!</p>}
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: '#f1f1f1',
                  margin: '5px 0',
                  padding: '10px',
                  borderRadius: '8px',
                  alignSelf: 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <strong>{msg.sender}</strong>
                <div>{msg.content}</div>
                <small style={{ color: 'gray' }}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </small>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows="3"
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Message;

