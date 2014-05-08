function Network() {
    // To server functions and constants
    function sendGameRequest(numPlayers) {
        var message = {"NumPlayers": numPlayers};
        sendMessage(NEW_GAME_CMD, message);
    }

    function sendClientToken(token) {
        var message = {"Token": token};
        sendMessage(CLIENT_INFO_CMD, message);
    }

    function sendViewWorld() {
        sendMessage(VIEW_WORLD_CMD, {});
    }

    function sendViewUnits() {
        sendMessage(VIEW_UNITS_CMD, {});
    }

    function sendViewTerrain() {
        sendMessage(VIEW_TERRAIN_CMD, {});
    }

    function sendViewPlayers() {
        sendMessage(VIEW_PLAYERS_CMD, {});
    }

    function sendTurn() {
        sendMessage(END_TURN_CMD, {});
    }

    function sendAttack(source, target, attackId) {
        // TODO actually parse this and send properly
        var message = {};
        sendMessage(ATTACK_CMD, message);
    }

    function sendUnitMove(unit, move) {
        var message = {move: []};
        for (var i = 0; i < move.length; i++) {
            message.move.push(move[i].position);
        }

        sendMessage(MOVE_UNIT_CMD, message);
    }

    function sendChatMessage(message) {
        sendMessage(CHAT_CMD, {"message": message})
    }

    CLIENT_INFO_CMD = "clientInfo";
    // newGame is the packet we send to the proxy to request a new game. Right
    // now we receive nothing back from this request
    NEW_GAME_CMD = "newGame";
    VIEW_WORLD_CMD = "viewWorld";
    VIEW_UNITS_CMD = "viewUnits";
    VIEW_TERRAIN_CMD = "viewTerrain";
    VIEW_PLAYERS_CMD = "viewPlayers";
    END_TURN_CMD = "turn";
    ATTACK_CMD = "attack";
    MOVE_UNIT_CMD = "move";
    CHAT_CMD = "chat";

    host = window.location.host.split(":")[0];
    port = getPortNum();
    ws_addr = "ws://" + host + ":" + port + "/ws";
    conn = new WebSocket(ws_addr);
    DELIM = ":";

    // This function expects the message as a javascript object
    function sendMessage(command, messageObj) {
        var jsonified = JSON.stringify(messageObj);
        packet = command + DELIM + jsonified;
        conn.send(packet);
    }

    // From server functions and constants
    this.packetHandlers = {};
    this.packetHandlers[VIEW_WORLD_CMD] = parseViewWorld.bind(this);
    this.packetHandlers[VIEW_UNITS_CMD] = parseViewUnits.bind(this);
    this.packetHandlers[VIEW_TERRAIN_CMD] = parseViewTerrain.bind(this);
    this.packetHandlers[VIEW_PLAYERS_CMD] = parseViewPlayers.bind(this);
    this.packetHandlers[CLIENT_INFO_CMD] = parseClientInfo.bind(this);
    // new is the response from the game server when a game is ready
    this.packetHandlers["new"] = parseGameRequestSuccess.bind(this);
    this.packetHandlers[MOVE_UNIT_CMD] = parseMoveResponse.bind(this);
    this.packetHandlers[END_TURN_CMD] = parseEndTurnResponse.bind(this);
    this.packetHandlers[ATTACK_CMD] = parseAttackResponse.bind(this);
    this.packetHandlers[CHAT_CMD] = parseChatResponse.bind(this);

    function logTemplateComp(name, realResponse) {
        if (!verifyStructure(responseTemplates[name], realResponse)) {
            console.log("The", name, "template does not match. Proceed with caution");
        }
    }

    function parseViewWorld(status, viewWorld) {
        this.logTemplateComp("viewWorld", viewWorld);
        testies = viewWorld;
        parseTerrain(game, viewWorld.TerrainResponse.terrain);
        // game.currentPlayerId = viewWorld.turnOwner;
        parseUnits(game, viewWorld.UnitsResponse.units);
        parsePlayers(game, viewWorld.PlayersResponse.players);
    }

    function parseViewUnits(status, viewUnits) {
        this.logTemplateComp(VIEW_UNITS_CMD, viewUnits);
        parseUnits(game, viewUnits.units);
    }

    function parseViewTerrain(status, viewTerrain) {
        this.logTemplateComp(VIEW_TERRAIN_CMD, viewTerrain)
        parseTerrain(game, viewTerrain.terrain);
    }

    function parseViewPlayers(status, viewPlayers) {
        this.logTemplateComp(VIEW_PLAYERS_CMD, viewPlayers);
        parsePlayers(viewPlayers.players);
    }

    function parseUnits(game, units) {
        for (i = units.length - 1; i >= 0; i--) {
            // this should be tank, but I've only got wizards right now
            // not sent movementType right now
            var unit = units[i];
            var position = unit.position;
            var movement = unit.movement;
            var unitnation = parseInt(unit.nation) + unit.name;
            var spriteName = UnitNationSprite[unitnation];
            var attacks = parseUnitAttacks(unit);
            var armor = parseUnitArmor(unit);
            if (!game.world.findUnit(position.x, position.y)) {
                game.world.addUnit(unit.nation, spriteName, position,
                                   movement.distance, movement.type,
                                   movement.speeds, unit.health, unit.maxHealth,
                                   unit.nation, unit.name, unit.canMove,
                                   attacks, armor);
            } else {
                console.log("Verifing the unit could be useful here");
            }
        }
    }

    function parseTerrain(game, terrain) {
        if (game.world === undefined) {
            game.world = new World(terrain.length, terrain[0].length);
            game.currentState = "CAMERA_CONTROL";
        }
        for (var x = 0; x < terrain.length; x++) {
            for (var y = 0; y < terrain[x].length; y++) {
                terrain[x][y] = terrainLookup(terrain[x][y], x, y);
            }
        }
        game.world.initialize(terrain);
    }

    function parsePlayers(game, players) {
        for (var id in players) {
            var player = players[id];
            game.world.addOrUpdatePlayer(id, player.nation,
                                         player.team);
        }
    }

    function parseUnitAttacks(unit) {
        return unit.attacks;
    }

    function parseUnitArmor(unit) {
        return unit.armor;
    }

    function parseClientInfo(status) {
        console.log("Your client info has been received, sending game request");
        this.sendGameRequest(parseInt(desiredPlayers));
    }

    function parseGameRequestSuccess(status) {
        console.log("Congratulations, you've been matched to a game!");
        this.sendViewWorld();
    }

    function parseMoveResponse(status, response) {
        if (status === 0) {
            var path = response.move;
            var unit = game.world.findUnit(path[0].x, path[0].y);
            if (path) {
                // tell the renderer about the move
                var unitSprite = assets.spriteManager.getSprite(unit.spriteName);
                // unitSprite.movements = unitSprite.movements.concat(translatePathToMoves(path));
                var goal = path[path.length - 1];
                game.world.moveUnit(unit.pos, goal);
                // shim, while the mac tab crash bug is still happening
                unitSprite.drawPos = goal;
                unit.canMove = false;
                unitControlState.reset();
            } else {
                console.log("Your path is null, man");
            }
        } else {
            console.log("Go a bad status from server:", status);
        }
    }

    function parseAttackResponse(status, response) {
        console.log("Not implemented", response);
    }

    function parseEndTurnResponse(status, response) {
        if (status == 0) {
            console.log("Turn ended successfully. Resetting unit state");
            game.world.resetUnits(response.playerId);
        } else {
            console.log("Bad status ending turn: ", status);
        }
    }

    function parseChatResponse(status, data) {
        console.log("Chat: " + data.message);
    }

    conn.onopen = function () {
        this.sendClientInfo();
    }.bind(this);

    // Log errors
    conn.onerror = function (error) {
        console.log('WebSocket Error ' + error);
    };

    // Log messages from the server
    conn.onmessage = function (e) {
        var cmds = trimSocketChars(e.data.actualSplit(DELIM, 2));
        if (cmds.length == 2) {
            var pkt_type = cmds[0];
            var response = JSON.parse(cmds[1]);
            var dataObj = response.payload;
            var status = response.status;
            // It's likely the individual handlers would be interested in the
            // failure condition
            if (status >= 0) {
                var handler = this.packetHandlers[pkt_type];
                if (handler !== undefined) {
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
    };

    this.sendClientInfo = function() {
        var token = $.cookie("token");
        if (token) {
            sendClientToken(token);
        } else {
            alert("You do not have a token, can't start game");
        }
    };

    this.sendViewWorld = function() {
        sendViewWorld();
    };

    this.sendUnitMove = function(unit, move) {
        sendUnitMove(unit, move);
    };

    this.sendViewUnits = function() {
        sendViewUnits();
    };

    this.sendViewTerrain = function() {
        sendViewTerrain();
    };

    this.sendViewPlayers = function() {
        sendViewPlayers();
    };

    this.sendAttack = function(source, target, attackId) {
        sendAttack(source, target, attackId);
    };

    this.sendTurn = function() {
        sendTurn();
    }

    this.logTemplateComp = function(name, realResponse) {
        logTemplateComp(name, realResponse);
    };

    this.sendChatMessage = sendChatMessage;
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
};
