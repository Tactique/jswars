package warserver

import (
    "flag"
    "warserver/logger"
    "net/http"
    "strings"
)

var static_http = http.NewServeMux()

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
    debugEnabled := flag.Bool("debug", true, "Enable debug")
    flag.Parse()

    port = newPortInfo(*portstring)

    logger.SetupLogger(logger.DEBUG, logger.USUAL)
    setupGamehub()

    go gamehub.handleConnections()

    static_http.Handle("/", http.FileServer(http.Dir("./")))

    http.HandleFunc("/", serveIndex)
    http.HandleFunc("/editor", serveEditor)
    http.HandleFunc("/ws", serveWs)
    if (*debugEnabled) {
        http.HandleFunc("/tests", serveTests)
    }

    logger.Debugf("Http server listening on port %s", port);
    err := http.ListenAndServe(port.Port, nil)
    if err != nil {
        logger.Fatalf("ListenAndServe: %s", err.Error())
    }
}
