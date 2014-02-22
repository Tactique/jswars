package warserver

import (
    "flag"
    "warserver/logger"
    "net/http"
    "strings"
)

type PortInfo struct {
    Port string
}

func newPortInfo(portstring string) PortInfo {
    if (strings.Contains(portstring, ":")) {
        return PortInfo{Port: portstring}
    }
    return PortInfo{Port: ":" + portstring}
}

var port PortInfo

func Main() {
    portstring := flag.String("port", ":8888", "Server port")
    flag.Parse()

    port = newPortInfo(*portstring)

    logger.SetupLogger(logger.DEBUG, logger.USUAL)
    setupGamehub()

    go gamehub.handleConnections()

    http.HandleFunc("/ws", serveWs)

    logger.Debugf("Http server listening on port %s", port);
    err := http.ListenAndServe(port.Port, nil)
    if err != nil {
        logger.Fatalf("ListenAndServe: %s", err.Error())
    }
}
