package warserver

import (
    "flag"
    "warserver/logger"
    "warserver/PortMgmt"
    "net/http"
)


var port PortMgmt.PortInfo
var tcpPort PortMgmt.PortInfo
var porterPort PortMgmt.PortInfo
var porterIP PortMgmt.IPString

func Main() {
    porterIPString := flag.String("porterIP", "127.0.0.1", "Porter Server IP")
    porterPortString := flag.String("porterPort", ":5269", "Porter Server Port")
    portstring := flag.String("port", ":8888", "Server port")
    tcpportstring := flag.String("tcpport", ":11199", "TCP socket port")
    logpath := flag.String("logpath", "/dev/stderr", "Logging location")
    flag.Parse()

    port = PortMgmt.NewPortInfo(*portstring)
    tcpPort = PortMgmt.NewPortInfo(*tcpportstring)
    porterPort = PortMgmt.NewPortInfo(*porterPortString)
    porterIP = PortMgmt.IPString(*porterIPString)

    logger.SetupLoggerHelper(*logpath)
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
