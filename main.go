package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/hypebeast/go-osc/osc"
	"os"
	"os/signal"
	"time"
)

var config *Config
var wsConn *websocket.Conn
var oscClient *osc.Client
var connected bool
var timeout *time.Timer
var done chan struct{}

func init() {
	ConfigLoader()
}

func ExitProgram(msg string) {
	fmt.Println(msg)
	fmt.Println("press 'enter' to exit this program")
	_, _ = fmt.Scanln()
	os.Exit(0)
}

func main() {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	if config.WidgetId == "" {
		ExitProgram("widget_id is empty!!")
		return
	}

	done = make(chan struct{})
	oscClient = osc.NewClient(config.OscHost, int(config.OscPort))
	timeout = time.NewTimer(0)
	go WsTimeoutChecker()

	url, err := GetWebSocketUrl(config.WidgetId)
	if err != nil {
		ExitProgram("an error occurred while getting websocket url!!")
		return
	}

	fmt.Println("connecting to stromno websocket server")
	wsConn, _, err = websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		ExitProgram("stromno websocket server connection failed..")
		return
	}
	fmt.Println("stromno websocket server connected!")
	defer func() { _ = wsConn.Close() }()

	go WsReceiver()

	for {
		select {
		case <-done:
			SetConnectedValue(false)
			return
		case <-interrupt:
			SetConnectedValue(false)
			return
		}
	}
}
