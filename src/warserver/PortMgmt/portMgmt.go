package PortMgmt

import (
    "strings"
)

type PortInfo struct {
    Port string
}

type IPString string

func NewPortInfo(portstring string) PortInfo {
    if (strings.Contains(portstring, ":")) {
        return PortInfo{Port: portstring}
    }
    return PortInfo{Port: ":" + portstring}
}
