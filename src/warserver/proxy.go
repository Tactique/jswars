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
    ws []*websocket.Conn
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

func (p *proxy) wsReadPump(wsNum int) {
    p.proxyConn.ws[wsNum].SetReadLimit(RECV_BUF_LEN)
    for {
        _, msg, err := p.proxyConn.ws[wsNum].ReadMessage()
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
        for i := range p.proxyConn.ws {
            logger.Debugf("Writing %s to websocket", msg)
            err := p.proxyConn.ws[i].WriteMessage(websocket.TextMessage, msg)
            if err != nil {
                logger.Errorf("Error while writing to websocket: %s", err)
                break
            }
        }
    }
}

func (p *proxy) launchProxy() {
    go p.sockReadPump()
    for i := 0; i < len(p.proxyConn.ws); i++ {
        go p.wsReadPump(i)
    }
    go p.sockWritePump()
    go p.wsWritePump()
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
    gamehub.wsRegister <- ws
}
