function Network() {
    // To server functions and constants
    function sendGameRequest(numPlayers) {
        var message = {"NumPlayers": numPlayers}
        sendMessage(NEW_GAME_CMD, message)
    }

    function sendClientInfo(playerId) {
        var message = {"Id": playerId}
        sendMessage(CLIENT_INFO_CMD, message);
    }

    function sendViewWorld() {
        sendMessage(VIEW_WORLD_CMD, {});
    }

    CLIENT_INFO_CMD = "clientInfo";
    NEW_GAME_CMD = "newGame";
    VIEW_WORLD_CMD = "view";

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

    // From server functions and constants
    this.packetHandlers = {
        "view": parseViewWorld,
    }

    function parseViewWorld(status, world) {
        console.log(world);
    }

    // When the connection is open, send some data to the server
    conn.onopen = function () {
        network.sendClientInfo(getPlayerId());
    };

    // Log errors
    conn.onerror = function (error) {
        console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    conn.onmessage = function (e) {
        var cmds = e.data.actualSplit(DELIM, 3);
        console.log(cmds);
        var pkt_type = cmds[0];
        var status = cmds[1];
        if (cmds.length > 2) {
            console.log(cmds[2]);
            var dataObj = JSON.parse(cmds[2]);
            console.log(pkt_type, status, dataObj);
            var handler = this.packetHandlers[pkt_type];
            if (handler != null) {
                handler(status, dataObj);
            } else {
                console.log("Recieved unknown command:", pkt_type);
            }
        }
    };

    this.sendGameRequest = function(numPlayers) {
        sendGameRequest(numPlayers);
    }

    this.sendClientInfo = function(playerId) {
        sendClientInfo(playerId);
    }

    this.sendViewWorld = function() {
        sendViewWorld();
    }
}

String.prototype.actualSplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? split.slice(0, maxsplit - 1).concat(split.slice(maxsplit - 1, split.length).join(":")) : split;
}
