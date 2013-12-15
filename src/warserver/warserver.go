package warserver

import (
    "warserver/logger"
    "net/http"
)

var static_http = http.NewServeMux()

func Main() {
    logger.SetupLogger(logger.DEBUG, logger.USUAL)
    setupGamehub()

    go gamehub.handleConnections()

    static_http.Handle("/", http.FileServer(http.Dir("./")))

    http.HandleFunc("/", serveIndex)
    http.HandleFunc("/ws", serveWs)

    logger.Debug("Http server listening on port 8888")
    err := http.ListenAndServe(":8888", nil)
    if err != nil {
        logger.Fatalf("ListenAndServe: %s", err.Error())
    }
}
