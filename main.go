package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"os"
	"os/signal"
)

var config *Config

func init() {
	config = new(Config)
	config.OscHost = "127.0.0.1"
	config.OscPort = 9000
	config.OscPath = "/avatar/parameters/heartbeat"
	config.WidgetId = ""
	config.MaxHeartRate = 200

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
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	if config.WidgetId == "" {
		panic("widget_id is empty!!")
	}

	webSocketUrl := GetWebSocketUrl(config.WidgetId)
	fmt.Println(webSocketUrl)
	c, _, err := websocket.DefaultDialer.Dial(webSocketUrl, nil)
	if err != nil {
		panic(err)
	}

	defer c.Close()
	done := make(chan struct{})

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
		}
	}()

	for {
		select {
		case <-done:
			return
		case <-interrupt:
			log.Println("interrupt")
			return
		}
	}
}
