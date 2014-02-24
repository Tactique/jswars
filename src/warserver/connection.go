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
    buf := make([]byte, RECV_BUF_LEN)
    _, err := c.sock.Read(buf)
    return buf, err
}

func (c *socketConn) Write(msg []byte) error {
    _, err := c.sock.Write(msg)
    return err
}

func (c *socketConn) Close() {
    c.sock.Close()
}
