package warserver

import (
    "fmt"
    "net/http"
)

var static_http = http.NewServeMux()

func Main() {
    static_http.Handle("/", http.FileServer(http.Dir("./")))

    http.HandleFunc("/", serveIndex)
    fmt.Println("Set up handlers")

    fmt.Println("Http server listening on port 8888")
    http.ListenAndServe(":8888", nil)
}
