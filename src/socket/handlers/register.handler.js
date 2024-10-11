const registerHandler = async (io) => {
  io.on('connection', async (socket) => {
    // if (!CLIENT_VERSION.includes(socket.handshake.query.clientVersion)) {
    //   socket.disconnect(true);
    //   return;
    // }
    socket.on('event', (data) => handlerEvent(io, socket, data));
    socket.on('disconnect', (socket) => handleDisconnect(socket, userUUID));
  });
};

export default registerHandler;
