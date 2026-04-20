const statuses = ['on-time', 'delayed', 'in-flight', 'boarding', 'landed'];

function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Simulate live flight updates every 3-5 seconds
    const interval = setInterval(() => {
      const flightId = `AS${String(1000 + Math.floor(Math.random() * 25)).slice(1)}`;
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const update = {
        flightId,
        status: newStatus,
        delay: newStatus === 'delayed' ? Math.floor(15 + Math.random() * 165) : 0,
        timestamp: new Date().toISOString(),
      };
      socket.emit('flight:update', update);
    }, 3000 + Math.random() * 2000);

    socket.on('disruption:inject', (data) => {
      console.log(`[WS] Disruption injected:`, data);
      socket.emit('disruption:result', {
        ...data,
        affectedCount: Math.floor(3 + Math.random() * 8),
        totalDelay: Math.floor(data.severity * 300),
      });
    });

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSockets;
