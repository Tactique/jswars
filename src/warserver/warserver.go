package warserver

import (
    "flag"
    "warserver/logger"
    "net/http"
    "os"
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

func setupLogger(path string) {
    if strings.Contains(path, "/dev/stderr") {
        logfile := os.Stderr
        logger.SetupLogger(logger.DEBUG, logger.USUAL, logfile)
    } else {
        reallog, err := os.Create(path)
        if err != nil {
            panic(err)
        }
        logger.SetupLogger(logger.DEBUG, logger.USUAL, reallog)
    }
}

var port PortInfo
var tcpPort PortInfo

func Main() {
    portstring := flag.String("port", ":8888", "Server port")
    tcpportstring := flag.String("tcpport", ":11199", "TCP socket port")
    logpath := flag.String("logpath", "/dev/stderr", "Logging location")
    flag.Parse()

    port = newPortInfo(*portstring)
    tcpPort = newPortInfo(*tcpportstring)

    setupLogger(*logpath)
    setupGamehub()

    go gamehub.handleConnections()

    go socketListen(tcpPort.Port)
    logger.Debugf("Socket listening on port %s", tcpPort)

    http.HandleFunc("/ws", serveWs)

    logger.Debugf("Http server listening on port %s", port);
    err := http.ListenAndServe(port.Port, nil)
    if err != nil {
        logger.Fatalf("ListenAndServe: %s", err.Error())
    }
}
