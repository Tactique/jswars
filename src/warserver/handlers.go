package warserver

import (
    "html/template"
    "net/http"
    "regexp"
)

// matches for urls which contain file name extensions, ie static files
var static_regex = regexp.MustCompile("/([^/]*\\.[^/]*)$"); 

func serveIndex(w http.ResponseWriter, r *http.Request) {
    // check for and process static file requests
    matches := static_regex.FindStringSubmatch(r.URL.Path)
    if (len(matches) > 0) {
        static_http.ServeHTTP(w, r)
    }
    // return the index.html
    t, err := template.ParseFiles("index.html")
    if (err != nil) {
        panic(err)
    }
    t.Execute(w, "")
}
