package warserver

import (
    "fmt"
    "github.com/gorilla/websocket"
    "io"
    "net"
    "net/http"
    "strconv"
    "strings"
    "warserver/logger"
)

const (
    RECV_BUF_LEN = 1024
    SERVER_IP = "localhost"
    SERVER_PORT = "5269"
)

type websocketHandler interface {
    handleWebsocket(message []byte, cconn *clientConnection)
}

type clientInfo struct {
    Id int
}

type clientConnection struct {
    conn connection
    currentHandler websocketHandler
    handlers chan websocketHandler
    toClient chan []byte
    info clientInfo
}

type serverConnection struct {
    conn net.Conn
}

type pipe struct {
    wsRecv chan []byte
    sockRecv chan []byte
}

type proxy struct {
    proxyConns []*clientConnection
    server *serverConnection
}

func (p *proxy) slotClientConnection(slot int, cconn *clientConnection) {
    p.proxyConns[slot] = cconn;
}

func (p *proxy) removeClientConnection(pos int) {
    j := pos + 1
    copy(p.proxyConns[pos:], p.proxyConns[j:])
    for k, n := len(p.proxyConns) - j + pos, len(p.proxyConns); k < n; k ++ {
        p.proxyConns[k] = nil // or the zero value of T
    } // for k
    p.proxyConns = p.proxyConns[:len(p.proxyConns) - j + pos]
}

func (p *proxy) handleWebsocket(message []byte, cconn *clientConnection) {
    logger.Infof("Proxying message from client: %s", message)
    _, err := p.server.conn.Write(message)
    if err != nil {
        logger.Errorf("Error while writing to socket: %s", err)
    }
}

func (p *proxy) serverReadPump() {
    defer func() {
        p.server.conn.Close()
    }()
    for {
        buf := make([]byte, RECV_BUF_LEN)
        _, err := p.server.conn.Read(buf)
        if err != nil {
            logger.Errorf("Error while reading from socket: %s", err)
            break
        }
        logger.Debugf("Received %s from socket", buf)
        p.broadcast(buf)
    }
}

func (p *proxy) broadcast(message []byte) {
    for i := 0; i < len(p.proxyConns); i++ {
        p.proxyConns[i].toClient <- message
    }
}

func (p *proxy) sendInitialGameInfo() {
    // I'll send basically this once the server can accept it
    message := "new:{\"uids\": ["
    for i := 0; i < len(p.proxyConns); i++ {
        message = message + strconv.Itoa(p.proxyConns[i].info.Id)
        if (i < (len(p.proxyConns) - 1)) {
            message = message + ", "
        }
    }
    message = message + "], \"debug\": 0}"
    logger.Infof("%s", message)
    p.server.conn.Write([]byte(message))
}

func (pc *clientConnection) wsReadPump() {
    defer func() {
        pc.conn.Close()
    }()
    for {
        msg, err := pc.conn.Read()
        if err != nil {
            if err == io.EOF || err == io.ErrUnexpectedEOF {
                // the client ID here is redundant...
                killcconn := fmt.Sprintf("killClient:{\"Id\": %d}", pc.info.Id)
                pc.currentHandler.handleWebsocket([]byte(killcconn), pc)
            } else {
                logger.Errorf("Error while reading from websocket: %s", err)
            }
            break
        }
        logger.Debugf("Received %s from websocket", msg)
        select {
        case newHandler := <-pc.handlers:
            pc.currentHandler = newHandler
        default:
        }
        pc.currentHandler.handleWebsocket(msg, pc)
    }
}

func (pc *clientConnection) wsWritePump() {
    for msg := range pc.toClient {
        logger.Debugf("Writing %s to websocket", msg)
        err := pc.conn.Write(msg)
        if err != nil {
            logger.Errorf("Error while writing to websocket: %s", err)
            break
        }
    }
}

func connectToServer() (net.Conn, error) {
    return net.Dial("tcp", SERVER_IP + ":" + SERVER_PORT)
}

func serveWs(w http.ResponseWriter, r *http.Request) {
    if r.Method != "GET" {
        http.Error(w, "Method not allowed", 405)
        return
    }
    if strings.Split(r.Header.Get("Origin"),":")[1] != strings.Split("http://"+r.Host,":")[1] {
        logger.Warnf("Cross origin problem: %s", r.Host)
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
    ws.SetReadLimit(RECV_BUF_LEN)
    conn := &websocketConn{ws: ws}
    gamehub.connRegister<- conn
}
