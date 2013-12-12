package warserver

import (
    "container/list"
    "github.com/gorilla/websocket"
    "warserver/logger"
)

const (
    NUM_PLAYERS = 2
)

type game_hub struct {
    uncommittedGames *list.List
    committedGames *list.List
    wsRegister chan *websocket.Conn
}

func (gh *game_hub) handleWebsocket(message []byte) {
}

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
