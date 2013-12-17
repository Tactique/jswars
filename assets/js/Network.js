function Network() {
    function sendGameRequest(numPlayers) {
        var message = {"NumPlayers": numPlayers}
        sendMessage(GAMEREQUEST, message)
    }

    GAMEREQUEST = "newGame";

    host = window.location.host.split(":")[0];
    port = "8888"
    ws_addr = "ws://" + host + ":" + port + "/ws"
    conn = new WebSocket(ws_addr);
    DELIM = ":"

    // This function expects the message as a javascript object
    function sendMessage(command, messageObj) {
        var jsonified = JSON.stringify(messageObj)
        packet = command + DELIM + jsonified;
        conn.send(packet)
    }

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

    this.sendGameRequest = function(numPlayers) {
        sendGameRequest(numPlayers)
    }
}
