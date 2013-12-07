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
    // a list of waiting websocket connections 
    wsConnections *list.List
    // a list of all the proxies
    proxies *list.List
    // incoming websocket connections
    wsRegister chan *websocket.Conn
}

var gamehub = game_hub {
    wsConnections: list.New(),
    proxies: list.New(),
    wsRegister: make(chan *websocket.Conn),
}

func (gh *game_hub) handleConnections() {
    for c := range gh.wsRegister {
        gh.wsConnections.PushBack(c)
        if gh.wsConnections.Len() >= NUM_PLAYERS {
            gh.makeGame(NUM_PLAYERS)
        }
    }
}

func (gh *game_hub) makeGame(numPlayers int) {
    sock, err := connectToServer()
    if err != nil {
        logger.Errorf("Could not connect to server: %s", err)
        return
    }
    c := connection{ws: make([]*websocket.Conn, numPlayers), sock: sock}
    for i := 0; i < numPlayers; i++ {
        tmp := gh.wsConnections.Remove(gh.wsConnections.Front())
        ws, _ := tmp.(*websocket.Conn)
        c.ws[i] = ws
    }
    p := pipe{wsRecv: make(chan []byte, 1024), sockRecv: make(chan []byte, 1024)}
    prox := &proxy{proxyConn: c, proxyPipes: p}
    prox.launchProxy()
    
    logger.Info("Connections successfully established. Proxying...")
}
