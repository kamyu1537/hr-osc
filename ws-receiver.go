package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/hypebeast/go-osc/osc"
	"time"
)

var connected bool

func SetConnectedValue(conn bool) {
	_ = oscc.Send(osc.NewMessage(config.OscConnectedPath, conn))
	connected = conn
}

func ConnectWebSocketServer(address string) {
	timeout := time.NewTimer(0)
	go receiveTimeout(timeout)

	fmt.Println("connecting to stromno websocket server")
	ws, _, err := websocket.DefaultDialer.Dial(address, nil)
	if err != nil {
		ExitProgram("stromno websocket server connection failed..")
		return
	}
	fmt.Println("stromno websocket server connected!")
	defer func() { _ = ws.Close() }()

	receiveMessage(ws, timeout)
}

func receiveMessage(ws *websocket.Conn, timer *time.Timer) {
	defer close(done)
	for {
		_, message, err := ws.ReadMessage()
		if err != nil {
			fmt.Println(err.Error())
			fmt.Println("message receive error!")
			continue
		}

		var msg WebSocketReceiveMessage
		err = json.Unmarshal(message, &msg)
		if err != nil {
			fmt.Println(err.Error())
			fmt.Println("json read failed!")
			continue
		}

		fmt.Printf("Your HeartRate: %d\n", msg.Data.HeartRate)
		heartRatePercent := float64(msg.Data.HeartRate) / float64(config.MaxHeartRate)
		_ = oscc.Send(osc.NewMessage(config.OscPercentPath, float32(heartRatePercent)))
		timer.Reset(time.Second * time.Duration(config.Timeout))
		SetConnectedValue(true)
	}
}

func receiveTimeout(timer *time.Timer) {
	for {
		<-timer.C
		if connected == true {
			SetConnectedValue(false)
			fmt.Println("websocket disconnected")
		}
	}
}
