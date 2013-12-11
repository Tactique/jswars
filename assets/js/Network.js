host = window.location.host.split(":")[0];
port = "8888"
ws_addr = "ws://" + host + ":" + port + "/ws"
conn = new WebSocket(ws_addr);

// When the connection is open, send some data to the server
conn.onopen = function () {
    // eventually send some login info
};

// Log errors
conn.onerror = function (error) {
    console.log('WebSocket Error ' + error);
};

// Log messages from the server
conn.onmessage = function (e) {
    console.log('Server: ' + e.data);
};
