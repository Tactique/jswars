package warserver

import (
    "warserver/logger"
    "warserver/proxy"
    "net/http"
)

var static_http = http.NewServeMux()

func Main() {
    logger.SetupLogger(logger.DEBUG, logger.USUAL)

    static_http.Handle("/", http.FileServer(http.Dir("./")))

    http.HandleFunc("/", serveIndex)
    http.HandleFunc("/ws", proxy.ServeWs)

    logger.Debug("Http server listening on port 8888")
    http.ListenAndServe(":8888", nil)
}
