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

type game struct {
    numPlayers int
    proxy proxy
}

var gamehub = game_hub {
    wsRegister: make(chan *websocket.Conn),
}

func (gh *game_hub) handleConnections() {
    
}

func (gh *game_hub) makeGame(numPlayers int) {
    _, err := connectToServer()
    if err != nil {
        logger.Errorf("Could not connect to server: %s", err)
        return
    }
    
    logger.Info("Connections successfully established. Proxying...")
}
