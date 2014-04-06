package connection 

import (
    "encoding/binary"
    "io"
    "github.com/gorilla/websocket"
    "net"
)

type Connection interface {
    Read() ([]byte, error)
    Write(msg []byte) error
    Close()
}

type WebsocketConn struct {
    ws *websocket.Conn
}

func NewWebsocketConn(ws *websocket.Conn) *WebsocketConn {
    return &WebsocketConn{ws: ws}
}

func (c *WebsocketConn) Read() ([]byte, error) {
    _, msg, err := c.ws.ReadMessage()
    return msg, err
}

func (c *WebsocketConn) Write(msg []byte) error {
    return c.ws.WriteMessage(websocket.TextMessage, msg)
}

func (c *WebsocketConn) Close() {
    c.ws.Close()
}

type SocketConn struct {
    sock net.Conn
}

func NewSocketConn(sock net.Conn) *SocketConn {
    return &SocketConn{sock: sock}
}

func (c *SocketConn) Read() ([]byte, error) {
    // the 32 bit initial message dictates the size of the message
    sizeBuf := make([]byte, 4)
    _, err := io.ReadFull(c.sock, sizeBuf)
    if err != nil {
        return nil, err
    }
    size, _ := binary.Varint(sizeBuf)
    msgBuf := make([]byte, size)
    _, err = io.ReadFull(c.sock, msgBuf)
    return msgBuf, err
}

func (c *SocketConn) Write(msg []byte) error {
    lenBuf := make([]byte, 4)
    msgLen := len(msg)
    binary.PutUvarint(lenBuf, uint64(msgLen))
    err := c.fullWrite(lenBuf)
    if err != nil {
        return err
    }
    return c.fullWrite(msg)
}

func (c *SocketConn) fullWrite(msg []byte) error {
    msgLen := len(msg)
    n, err := c.sock.Write(msg)
    for num_sent := 0; num_sent < msgLen; n, err = c.sock.Write(msg) {
        num_sent += n
        msg = msg[n:]
        if err != nil && err != io.ErrShortWrite {
            return err
        }
    }
    return err
}

func (c *SocketConn) Close() {
    c.sock.Close()
}
