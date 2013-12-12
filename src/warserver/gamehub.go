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
    numPlayers float64
}

type game_hub struct {
    uncommittedGames *list.List
    committedGames *list.List
    wsRegister chan *websocket.Conn
    localHandlers map[string]func(message string)
}

func (gh *game_hub) handleWebsocket(message []byte) {
    cmds := strings.SplitN(string(message), ":", 2)
    if len(cmds) == 2 {
        if fun, ok := gh.localHandlers[cmds[0]]; ok {
            fun(cmds[1])
        } else {
            logger.Warnf("Unrecognized command: %s", cmds[0])
        }
    } else {
        logger.Errorf("Malformed command: %s", cmds)
    }
}

func (gh game_hub) handleNewGame(message string) {
    ng := newGame{}
    err := json.Unmarshal([]byte(message), &ng)
    if err != nil {
        logger.Warnf("Error unmarshalling json: %s", err)
        return
    }
    logger.Infof("%s", ng.numPlayers)
    logger.Infof("Got new game %s", ng)
}

type game struct {
    numPlayers int
    proxy proxy
}

var gamehub = game_hub {
    wsRegister: make(chan *websocket.Conn),
    localHandlers: make(map [string]func(message string)),
}

func setupGamehub() {
    gamehub.localHandlers["newGame"] = gamehub.handleNewGame
}

func (gh *game_hub) handleConnections() {
    for conn := range gh.wsRegister {
        cconn := clientConnection{ws: conn, currentHandler: gh, handlers: make(chan websocketHandler)}
        go cconn.wsReadPump()
    }
}

func (gh *game_hub) makeGame(numPlayers int) {
    _, err := connectToServer()
    if err != nil {
        logger.Errorf("Could not connect to server: %s", err)
        return
    }

    logger.Info("Connections successfully established. Proxying...")
}
