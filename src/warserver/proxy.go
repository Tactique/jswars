package warserver

import (
    "github.com/gorilla/websocket"
    "net"
    "net/http"
    "warserver/logger"
)

const (
    RECV_BUF_LEN = 1024
    SERVER_IP = "192.168.0.100"
    SERVER_PORT = "5269"
)

type connection struct {
    ws *websocket.Conn
    sock net.Conn
}

type pipe struct {
    wsRecv chan []byte
    sockRecv chan []byte
}

type proxy struct {
    proxyConn connection
    proxyPipes pipe
}

func (p *proxy) sockReadPump() {
    for {
        buf := make([]byte, RECV_BUF_LEN)
        _, err := p.proxyConn.sock.Read(buf)
        if err != nil {
            logger.Errorf("Error while reading from socket: %s", err)
            break
        }
        logger.Debugf("Received %s from socket", buf)
        p.proxyPipes.wsRecv <- buf
    }
}

func (p *proxy) wsReadPump() {
    p.proxyConn.ws.SetReadLimit(RECV_BUF_LEN)
    for {
        _, msg, err := p.proxyConn.ws.ReadMessage()
        if err != nil {
            logger.Errorf("Error while reading from websocket: %s", err)
            break
        }
        logger.Debugf("Received %s from websocket", msg)
        p.proxyPipes.sockRecv <- msg
    }
}

func (p *proxy) sockWritePump() {
    for msg := range p.proxyPipes.sockRecv {
        logger.Debugf("Writing %s to socket", msg)
        _, err := p.proxyConn.sock.Write(msg)
        if err != nil {
            logger.Errorf("Error while writing to socket: %s", err)
            break
        }
    }
}

func (p *proxy) wsWritePump() {
    for msg := range p.proxyPipes.wsRecv {
        logger.Debugf("Writing %s to websocket", msg)
        err := p.proxyConn.ws.WriteMessage(websocket.TextMessage, msg)
        if err != nil {
            logger.Errorf("Error while writing to websocket: %s", err)
            break
        }
    }
}

func ServeWs(w http.ResponseWriter, r *http.Request) {
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
    // with the websocket in hand, connect to the server
    sock, err := net.Dial("tcp", SERVER_IP + ":" + SERVER_PORT)
    if err != nil {
        logger.Errorf("Could not connect to server: %s", err)
        return
    }
    // create our resources
    c := connection{ws: ws, sock: sock}
    p := pipe{wsRecv: make(chan []byte, 1024), sockRecv: make(chan []byte, 1024)}
    prox := &proxy{proxyConn: c, proxyPipes: p}
    logger.Info("Connections successfully established. Proxying...")
    go prox.sockReadPump()
    go prox.wsReadPump()
    go prox.sockWritePump()
    prox.wsWritePump()
}
