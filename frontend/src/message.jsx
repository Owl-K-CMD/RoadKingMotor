import messageAct from './messageAxios'
import { useEffect , useState } from 'react'


const Message = () => {

  const [messages, setMessages] = useState([])
  const[input, setInput] = useState('')
  const [error, setError] = useState(null)


  useEffect(() => {
    messageAct.getAllMessage()
      .then((response) => {
        if (Array.isArray(response.data)) {
        setMessages(response.data)
        } else {
          console.error("Feched message is not an array:", response.data);
          setMessages([])
          setError("Could not load message correctly")
        }
       // .catch(error => {
         // console.error("Error fetching message:", error)
          //setError("Failed to fetch messages. Please try again later.")
        //})
      })
  }, [])

  const sendMessage = () => {
    if (!input.trim()) {
      return;
    }

    if (!currentUserId || currentUserId === 'USER_ID_PLACEHOLDER') {
      setError('User ID is not available. Please log in.')
      return;
    }

    const newMessagePayload = {
      sender: currentUserId,
      content: input,
    }

    try {
      setError(null);
      const savedMessage = messageAct.createMessage(newMessagePayload);
      setMessages(prevMessages => [...prevMessages, savedMessage])
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.error || "Failed to send message. Please try again later";
      setError(errorMessage);
    }

  };

  const enterMessage = (e) => {
    e.target.value()
    setInput(e.target.value)
  }

  return (
    <div>
      <input value = {input} onChange = {enterMessage} />
<h3>Chat Support</h3>
{error && <p style = {{ color: 'red'}}>{error}</p>}
<div className="message-list" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
        {messages.length === 0 && !error && <p>No messages yet. Start the conversation!</p>}
        {messages.map((msg) => (
          <div key={msg._id} className="message" style={{ marginBottom: '5px' }}>
            <strong>{ msg.sender?.username || msg.sender?.name || `User ${String(msg.sender).slice(-4) || 'Unknown'}`}: </strong>
            <span>{msg.content}</span>
            <small style={{ display: 'block', color: 'gray', fontSize: '0.8em' }}>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>
      
      <input value={input} onChange={enterMessage} />
      <button onClick={sendMessage}>Send</button>


    </div>
  )
}

export default Message

