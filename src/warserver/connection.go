package warserver

import (
    "github.com/gorilla/websocket"
    "net"
)

type connection interface {
    Read() ([]byte, error)
    Write(msg []byte) error
    Close()
}

type websocketConn struct {
    ws *websocket.Conn
}

func (c *websocketConn) Read() ([]byte, error) {
    _, msg, err := c.ws.ReadMessage()
    return msg, err
}

func (c *websocketConn) Write(msg []byte) error {
    return c.ws.WriteMessage(websocket.TextMessage, msg)
}

func (c *websocketConn) Close() {
    c.ws.Close()
}

type socketConn struct {
    sock net.Conn
}

func (c *socketConn) Read() ([]byte, error) {
    fullMsg := make([]byte, RECV_BUF_LEN)
    buf := make([]byte, RECV_BUF_LEN)
    // Uggo, there should only be one check for errors
    n, err := c.sock.Read(fullMsg)
    full_len := n
    if err != nil {
        return fullMsg, err
    }
    for ; fullMsg[full_len - 1] != byte('\n'); n, err = c.sock.Read(buf) {
        if err != nil {
            return fullMsg, err
        }
        fullMsg = append(fullMsg, buf[:n]...)
    }
    return fullMsg[:full_len - 1], nil
}

func (c *socketConn) Write(msg []byte) error {
    n, err := c.sock.Write(msg)
    for num_sent := len(msg) - n; num_sent > 0; n, err = c.sock.Write(msg) {
        num_sent -= n
        if err != nil {
            return err
        }
    }
    return err
}

func (c *socketConn) Close() {
    c.sock.Close()
}
