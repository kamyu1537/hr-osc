package main

import (
	"github.com/hypebeast/go-osc/osc"
	"os"
	"os/signal"
)

var (
	oscc *osc.Client
	done chan struct{}
)

func main() {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	if config.WidgetId == "" {
		ExitProgram("widget_id is empty!!")
		return
	}

	done = make(chan struct{})
	oscc = osc.NewClient(config.OscHost, int(config.OscPort))

	url, err := GetWebSocketUrl(config.WidgetId)
	if err != nil {
		ExitProgram("an error occurred while getting websocket url!!")
		return
	}

	go ConnectWebSocketServer(url)

	<-interrupt
	SetConnectedValue(false)
}
