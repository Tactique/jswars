package testique

import (
    "net"
    "flag"
    "strings"
    "warserver/logger"
    "warserver/PortMgmt"
    "warserver/connection"
)

const (
    RECV_BUF_LEN = 1024
)

var serverPort PortMgmt.PortInfo

var testHandlers = make(map [string]func(msg string) string)

func Main() {
    portString := flag.String("port", ":5269", "Test server port")
    flag.Parse()

    serverPort = PortMgmt.NewPortInfo(*portString)

    setupHandlers();

    // might as well go straight to std out for a testserver
    logger.SetupLoggerHelper("/dev/stdout")

    logger.Infof("Accepting testserver connections on port %s", serverPort)
    handleConnections(serverPort.Port)
}

func setupHandlers() {
    testHandlers["new"] = testNewGame
    testHandlers["view"] = testViewWorld
}

func testNewGame(msg string) string {
    return "new:success"
}

func testViewWorld(msg string) string {
    unit := "{\"unit\":{\"loc\":{\"x\": 1, \"y\": 2}," +
                       "\"name\": \"Tank\"," +
                       "\"nation\": \"0\"," +
                       "\"movement\":{" +
                            "\"speeds\":{\"0\":1}," +
                            "\"name\":\"treads\"" +
                                    "}" +
                     "}" +
            "}"
    return "view:success:{\"world\":{\"terrain\":[[0,0,0,0,0]," + 
                                                 "[0,0,0,0,0]," +
                                                 "[0,0,0,0,0]," +
                                                 "[0,0,0,0,0]," +
                                                 "[0,0,0,0,0]]," +
                                    "\"units\": [" + unit + "]}}"
}

}

func handleConnections(port string) {
    ln, err := net.Listen("tcp", port)
    if err != nil {
        logger.Fatalf("Could not open socket for listening: %s", err)
    }
    for {
        conn, err := ln.Accept()
        if err != nil {
            logger.Errorf("Could not accept connection from client: %s", err)
            continue
        }
        sconn := connection.NewSocketConn(conn)
        go serveConnection(sconn)
    }
}

func serveConnection(sock *connection.SocketConn) {
    logger.Info("Serving new test connection")
    for {
        msg, err := sock.Read()
        if err != nil {
            // Should gracefully shutdown someday on EOF or UnexpectedEOF
            logger.Errorf("Error reading from client: %s", err)
            break
        }
        resp := parseMessage(string(msg))
        err = sock.Write([]byte(resp))
        if err != nil {
            logger.Errorf("Error writing to client: %s", err)
            break
        }
    }
}

func parseMessage(msg string) string {
    cmds := strings.SplitN(msg, ":", 2)
    if len(cmds) == 2 {
        if fun, ok := testHandlers[cmds[0]]; ok {
            return fun(cmds[1])
        } else {
            logger.Warnf("Unrecognized command: %s", cmds[0])
            return "unrecognized:"
        }
    }
    return "malformed:"
}