package warserver

type game struct {
    numPlayers int
    currentPlayers int
    proxy *proxy
}

func (g *game) channelInHandler(handler websocketHandler) {
    for i := 0; i < g.numPlayers; i++ {
        g.proxy.proxyConns[i].handlers <- handler
    }
}
