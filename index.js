'use strict'
const http = require('http')
const app = require('./config')
const Server = http.Server(app)
const PORT = process.env.PORT || 8123
const io = require('socket.io')(Server)

Server.listen(PORT, () => console.log('Game server running on:', PORT))

const players = {}

io.on('connection', socket => {
  // When a player connects
  socket.on('new-player', state => {
    console.log('New player joined with state:', state)
    players[socket.id] = state
    // Emit the update-players method in the client side
    io.emit('update-players', players)
  })

  socket.on('disconnect', state => {
    delete players[socket.id]
    io.emit('update-players', players)
  })

  socket.on('new-bullet', data => {
    io.emit('send-bullet', data);
  })

  // When a player moves
  socket.on('move-player', data => {
    const { x, y, playerName, velocity } = data

    // If the player is invalid, return
    if (players[socket.id] === undefined) {
      return
    }

    // Update the player's data if he moved
    players[socket.id].x = x
    players[socket.id].y = y
    players[socket.id].playerName = {
      name: playerName.name
    }
    players[socket.id].velocity = {
      x: velocity.x,
      y: velocity.y
    }

    // Send the data back to the client
    io.emit('update-players', players)
  })
})