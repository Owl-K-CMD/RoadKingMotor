const { WebSocketServer } = require('ws')

const clients = new Set()

const initializeWebSocket = (server) => {
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    console.log('New client connected via WebSocket')
    clients.add(ws)

    ws.send(JSON.stringify({
      type: 'Server',
      text: 'Welcome to Live Support!'
    }))

    ws.on('message', (message) => {
      const messageAsString = message.toString()
      console.log('WebSocket message receive => %s', messageAsString)

    clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(messageAsString)
        }
      })
    })

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket')
      clients.delete(ws)
    })
  })

  console.log('WebSocket server initialized')
}

module.exports = initializeWebSocket;