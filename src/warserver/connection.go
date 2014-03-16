package warserver

import (
    "encoding/binary"
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
    // the 32 bit initial message dictates the size of the message
    sizeBuf := make([]byte, 4)
    _, err := c.sock.Read(sizeBuf)
    if err != nil {
        return nil, err
    }
    size, _ := binary.Varint(sizeBuf)
    msgBuf := make([]byte, size)
    _, err = c.sock.Read(msgBuf)
    return msgBuf, err
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
