package warserver

import (
    "container/list"
    "encoding/json"
    "github.com/gorilla/websocket"
    "strings"
    "warserver/logger"
)

const (
    NUM_PLAYERS = 2
)

type newGame struct {
    NumPlayers int
    cconn *clientConnection
}

type game_hub struct {
    gameRequests chan *newGame
    uncommittedGames map[int]*game
    committedGames *list.List
    wsRegister chan *websocket.Conn
    localHandlers map[string]func(message string, cconn *clientConnection)
}

func (gh *game_hub) handleWebsocket(message []byte, cconn *clientConnection) {
    cmds := strings.SplitN(string(message), ":", 2)
    if len(cmds) == 2 {
        if fun, ok := gh.localHandlers[cmds[0]]; ok {
            fun(cmds[1], cconn)
        } else {
            logger.Warnf("Unrecognized command: %s", cmds[0])
        }
    } else {
        logger.Errorf("Malformed command: %s", cmds)
    }
}

func (gh *game_hub) handleClientInfo(message string, cconn *clientConnection) {
    ci := clientInfo{}
    // I hate repeating this unmarshalling code, does Go allow something more general?
    err := json.Unmarshal([]byte(message), &ci)
    if err != nil {
        logger.Warnf("Error unmarshalling json: %s", err)
        return
    }
    cconn.info = ci
}

func (gh *game_hub) handleNewGame(message string, cconn *clientConnection) {
    ng := newGame{}
    err := json.Unmarshal([]byte(message), &ng)
    if err != nil {
        logger.Warnf("Error unmarshalling json: %s", err)
        return
    }
    ng.cconn = cconn
    logger.Infof("Got new game %s", ng)
    gh.gameRequests <- &ng
}

func (gh *game_hub) handleDisconnection(message string, cconn *clientConnection) {
    // Find the connection and kill it, cleaning up its game if necessary
    logger.Info("Client Disconnected. Cleaning up...")
    for np, game := range gh.uncommittedGames {
        for i := 0; i < game.currentPlayers; i++ {
            if game.proxy.proxyConns[i].info.Id == cconn.info.Id {
                game.proxy.removeClientConnection(i)
                game.currentPlayers -= 1
                if game.currentPlayers == 0 {
                    logger.Infof("%d player uncommitted game empty. Dropping", np)
                    delete(gh.uncommittedGames, np)
                }
                break
            }
        }
    }
}

func (gh *game_hub) handleConnections() {
    for conn := range gh.wsRegister {
        cconn := clientConnection{ws: conn, currentHandler: gh,
                                  handlers: make(chan websocketHandler, 5),
                                  toClient: make(chan []byte)}
        go cconn.wsReadPump()
        go cconn.wsWritePump()
    }
}

func (gh *game_hub) makeGame(numPlayers int) *game {
    proxy := proxy{proxyConns: make([]*clientConnection, numPlayers)}
    game := game{numPlayers: numPlayers, currentPlayers: 0,
                 proxy: &proxy}
    gh.uncommittedGames[numPlayers] = &game

    return &game
}

func (gh *game_hub) commitGame(game *game) {
    delete(gh.uncommittedGames, game.numPlayers)
    // make connection to server

    game.channelInHandler(game.proxy)

    gh.committedGames.PushBack(game)
}

func (gh *game_hub) processNewGameRequests() {
    for ng := range gh.gameRequests {
        // look for an existing game to satisfy the new request
        gm := gh.findGame(ng)
        // create a game if one can't be found
        if gm == nil {
            logger.Info("Couldn't find an available game. Creating a new one")
            gm = gh.makeGame(ng.NumPlayers)
        } else {
            logger.Info("Found existing game. Slotting in")
        }
        gm.proxy.slotClientConnection(gm.currentPlayers, ng.cconn)
        gm.currentPlayers += 1
        if gm.currentPlayers == gm.numPlayers {
            gh.commitGame(gm)
        }
    }
}

func (gh *game_hub) findGame(ng *newGame) *game {
    game := gh.uncommittedGames[ng.NumPlayers]
    return game
}

var gamehub = game_hub {
    gameRequests: make(chan *newGame),
    uncommittedGames: make(map [int]*game),
    committedGames: list.New(),
    wsRegister: make(chan *websocket.Conn),
    localHandlers: make(map [string]func(message string, cconn *clientConnection)),
}


func setupGamehub() {
    gamehub.localHandlers["clientInfo"] = gamehub.handleClientInfo
    // I need to make sure a client has sent their info before requesting a new game
    gamehub.localHandlers["newGame"] = gamehub.handleNewGame
    gamehub.localHandlers["killClient"] = gamehub.handleDisconnection

    go gamehub.processNewGameRequests()
}
