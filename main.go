package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/hypebeast/go-osc/osc"
	"log"
	"os"
	"os/signal"
	"time"
)

var config *Config

func init() {
	config = new(Config)
	config.OscHost = "127.0.0.1"
	config.OscPort = 9000
	config.OscConnectedPath = "/avatar/parameters/hr_connected"
	config.OscPercentPath = "/avatar/parameters/hr_percent"
	config.WidgetId = ""
	config.MaxHeartRate = 200
	config.Timeout = 10

	if _, err := os.Stat("./config.json"); errors.Is(err, os.ErrNotExist) {
		if file, err := os.Create("./config.json"); err != nil {
			panic(err)
		} else {
			defer file.Close()
			enc := json.NewEncoder(file)
			enc.SetIndent("", "  ")
			if err = enc.Encode(config); err != nil {
				panic(err)
			}
		}
	} else if b, err := os.ReadFile("./config.json"); err != nil {
		panic(err)
	} else if err = json.Unmarshal(b, config); err != nil {
		panic(err)
	}
}

func main() {
	if config.WidgetId == "" {
		fmt.Println("widget_id is empty!!")
		return
	}

	done := make(chan struct{})
	oscClient := osc.NewClient(config.OscHost, int(config.OscPort))
	timeout := time.NewTimer(0)
	connected := false

	go func() {
		defer close(done)
		for {
			<-timeout.C
			if connected == true {
				connected = false
				_ = oscClient.Send(osc.NewMessage(config.OscConnectedPath, false))
				fmt.Println("websocket disconnected")
			}
		}
	}()

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	webSocketUrl := GetWebSocketUrl(config.WidgetId)
	fmt.Printf("connecting to websocket server")
	c, _, err := websocket.DefaultDialer.Dial(webSocketUrl, nil)
	if err != nil {
		panic(err)
	}

	defer c.Close()

	go func() {
		defer close(done)
		for {
			_, message, err := c.ReadMessage()
			if err != nil {
				fmt.Println("message receive error!")
				return
			}

			msg := new(WebSocketReceiveMessage)
			err = json.Unmarshal(message, msg)
			if err != nil {
				fmt.Println("json read failed!")
				return
			}

			fmt.Printf("Your HeartRate: %d\n", msg.Data.HeartRate)
			heartRatePercent := float64(msg.Data.HeartRate) / float64(config.MaxHeartRate)
			_ = oscClient.Send(osc.NewMessage(config.OscPercentPath, float32(heartRatePercent)))
			timeout.Reset(time.Second * time.Duration(config.Timeout))
			if connected == false {
				connected = true
				_ = oscClient.Send(osc.NewMessage(config.OscConnectedPath, true))
			}
		}
	}()

	for {
		select {
		case <-done:
			_ = oscClient.Send(osc.NewMessage(config.OscConnectedPath, false))
			return
		case <-interrupt:
			log.Println("interrupt")
			return
		}
	}
}
