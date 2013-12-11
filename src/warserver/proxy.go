package warserver

import (
    "github.com/gorilla/websocket"
    "net"
    "net/http"
    "warserver/logger"
    "time"
)

const (
    RECV_BUF_LEN = 1024
    SERVER_IP = "localhost"
    SERVER_PORT = "5269"
)

type websocketHandler interface {
    handleWebsocket(message []byte)
}

type clientConnection struct {
    ws *websocket.Conn
    currentHandler websocketHandler
    handlers chan websocketHandler
}

type pipe struct {
    wsRecv chan []byte
    sockRecv chan []byte
}

type proxy struct {
    proxyConn clientConnection
    proxyPipes pipe
}

func (pc *clientConnection) wsReadPump() {
    pc.ws.SetReadLimit(RECV_BUF_LEN)
    for {
        _, msg, err := pc.ws.ReadMessage()
        if err != nil {
            logger.Errorf("Error while reading from websocket: %s", err)
            break
        }
        logger.Debugf("Received %s from websocket", msg)
        select {
        case newHandler := <-pc.handlers:
            pc.currentHandler = newHandler
        default:
        }
        pc.currentHandler.handleWebsocket(msg)
    }
}

type test1 struct {

}

func (t test1) handleWebsocket(message []byte) {
    logger.Debugf("TEST1: %s", message)
}

type test2 struct {

}

func (t test2) handleWebsocket(message []byte) {
    logger.Debugf("TEST2: %s", message)
}

func connectToServer() (net.Conn, error) {
    return net.Dial("tcp", SERVER_IP + ":" + SERVER_PORT)
}

func serveWs(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" {
            http.Error(w, "Method not allowed", 405)
            return
    }
    if r.Header.Get("Origin") != "http://"+r.Host {
            http.Error(w, "Origin not allowed", 403)
            return
    }
    ws, err := websocket.Upgrade(w, r, nil, 1024, 1024)
    if _, ok := err.(websocket.HandshakeError); ok {
            http.Error(w, "Not a websocket handshake", 400)
            return
    } else if err != nil {
            logger.Errorf("Websocket upgrade error: %s", err)
            return
    }
    t1 := test1{}
    t2 := test2{}
    conn := clientConnection{ws: ws, currentHandler: t1, handlers: make(chan websocketHandler)}
    go conn.wsReadPump()
    time.Sleep(10 * time.Second)
    conn.handlers<- t2
}
