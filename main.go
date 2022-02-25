package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/hypebeast/go-osc/osc"
	"log"
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

func main() {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	if config.WidgetId == "" {
		fmt.Println("widget_id is empty!!")
		os.Exit(0)
		return
	}

	done = make(chan struct{})
	oscClient = osc.NewClient(config.OscHost, int(config.OscPort))
	timeout = time.NewTimer(0)
	go WsTimeoutChecker()

	webSocketUrl := GetWebSocketUrl(config.WidgetId)
	fmt.Println("connecting to websocket server")
	var err error
	wsConn, _, err = websocket.DefaultDialer.Dial(webSocketUrl, nil)
	if err != nil {
		panic(err)
	}
	defer wsConn.Close()

	go WsReceiver()
	go OscParameterReceiver(func(msg *osc.Message) {
		SetConnectedValue(connected)
		fmt.Println("avatar change detected")
	})

	for {
		select {
		case <-done:
			SetConnectedValue(false)
			return
		case <-interrupt:
			log.Println("interrupt")
			return
		}
	}
}
