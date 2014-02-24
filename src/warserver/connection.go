package warserver

import (
    "github.com/gorilla/websocket"
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
