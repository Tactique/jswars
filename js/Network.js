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

    function sendUnitMove(unit, move) {
        var message = {move: []};
        for (var i = 0; i < move.length; i++) {
            message.move.push(move[i].position);
        };

        sendMessage(MOVE_UNIT_CMD, message);
    }

    CLIENT_INFO_CMD = "clientInfo";
    NEW_GAME_CMD = "newGame";
    VIEW_WORLD_CMD = "view";
    MOVE_UNIT_CMD = "move";

    host = window.location.host.split(":")[0];
    port = getPortNum();
    ws_addr = "ws://" + host + ":" + port + "/ws";
    conn = new WebSocket(ws_addr);
    DELIM = ":";

    // This function expects the message as a javascript object
    function sendMessage(command, messageObj) {
        var jsonified = JSON.stringify(messageObj)
        packet = command + DELIM + jsonified;
        conn.send(packet)
    }

    // From server functions and constants
    this.packetHandlers = {
        "view": parseViewWorld.bind(this),
        "clientinfo": parseClientInfo.bind(this),
        "new": parseGameRequestSuccess.bind(this),
        "move": parseMoveResponse.bind(this)
    }

    function logTemplateComp(name, realResponse) {
        if (!verifyStructure(responseTemplates[name], realResponse)) {
            console.log("The", name, "template does not match. Proceed with caution");
        }
    }

    function parseViewWorld(status, viewWorld) {
        this.logTemplateComp("viewWorld", viewWorld);
        var terrain = viewWorld.terrain;
        if (game.world == null) {
            // TODO check if the terrain actually exists first
            game.world = new World(terrain.length, terrain[0].length);
            game.currentState = "CAMERA_CONTROL";
        }
        for (var x = 0; x < terrain.length; x++) {
            for (var y = 0; y < terrain[x].length; y++) {
                // TODO terrain cells may someday be the actual JSON
                terrain[x][y] = terrainLookup(terrain[x][y], x, y);
            }
        }
        game.world.initialize(terrain);

        var units = viewWorld.units;
        for (var i = units.length - 1; i >= 0; i--) {
            // this should be tank, but I've only got wizards right now
            // not sent movementType right now
            var unit = units[i];
            var position = unit.position;
            var movement = unit.movement;
            var unitnation = parseInt(unit.nation) + unit.name;
            var spriteName = UnitNationSprite[unitnation];
            if (!game.world.findUnit(position.x, position.y)) {
                game.world.addUnit(unit.nation, spriteName, position,
                                   unit.distance, movement.type,
                                   movement.speeds, unit.health,
                                   unit.nation, unit.name);
            } else {
                console.log("Verifing the unit could be useful here");
            }
        }
    }

    function parseClientInfo(status) {
        console.log("Your client info has been received, sending game request");
        this.sendGameRequest(parseInt(desiredPlayers));
    }

    function parseGameRequestSuccess(status) {
        console.log("Congratulations, you've been matched to a game!");
        this.sendViewWorld();
    }

    function parseMoveResponse(status) {
        if (status == "success") {
            var unit = unitControlState.unit;
            var path = unitControlState.path;
            if (path) {
                // tell the renderer about the move
                var unitSprite = assets.spriteManager.getSprite(unit.spriteName);
                // unitSprite.movements = unitSprite.movements.concat(translatePathToMoves(path));
                var goal = path[path.length - 1];
                unit.pos.x = goal.position.x;
                unit.pos.y = goal.position.y;
                // shim, while the mac tab crash bug is still happening
                unitSprite.drawPos = goal.position;
                unitControlState.reset();
            } else {
                console.log("Your path is null, man");
            }
        } else {
            console.log("Go a bad status from server:", status);
        }
    }

    conn.onopen = function () {
        this.sendClientInfo(getPlayerId());
    }.bind(this);

    // Log errors
    conn.onerror = function (error) {
        console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    conn.onmessage = function (e) {
        var cmds = trimSocketChars(e.data.actualSplit(DELIM, 3));
        if (cmds.length >= 2) {
            var pkt_type = cmds[0];
            var status = cmds[1];
            var dataObj;
            if (status != "failure") {
                if (cmds.length > 2) {
                    dataObj = JSON.parse(cmds[2]);
                }
                var handler = this.packetHandlers[pkt_type];
                if (handler != null) {
                    handler(status, dataObj);
                } else {
                    console.log("Recieved unknown command:", pkt_type);
                }
            } else {
                console.log("Received failure from server:", cmds);
            }
        } else {
            console.log("Received malformed command:", cmds);
        }
    }.bind(this);

    this.sendGameRequest = function(numPlayers) {
        sendGameRequest(numPlayers);
    }

    this.sendClientInfo = function(playerId) {
        sendClientInfo(playerId);
    }

    this.sendViewWorld = function() {
        sendViewWorld();
    }

    this.sendUnitMove = function(unit, move) {
        sendUnitMove(unit, move);
    }

    this.logTemplateComp = function(name, realResponse) {
        logTemplateComp(name, realResponse);
    }
}

function trimSocketChars(cmds) {
    cmds[cmds.length - 1] = cmds[cmds.length - 1].replace(/\x00/gi, "");
    return cmds;
}

String.prototype.actualSplit = function(sep, maxsplit) {
    var split = this.split(sep);
    var excess = split.slice(maxsplit - 1, split.length).join(":");
    if (excess.length > 0) {
        return maxsplit ? split.slice(0, maxsplit - 1).concat(excess) : split;
    } else {
        return maxsplit ? split.slice(0, maxsplit - 1) : split;
    }
}