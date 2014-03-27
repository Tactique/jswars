package PortMgmt

import (
    "strings"
)

type PortInfo struct {
    Port string
}

func NewPortInfo(portstring string) PortInfo {
    if (strings.Contains(portstring, ":")) {
        return PortInfo{Port: portstring}
    }
    return PortInfo{Port: ":" + portstring}
}
