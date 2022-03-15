package main

import (
	"encoding/json"
	"errors"
	"log"
	"os"
)

var config *Config

func ConfigLoader() {
	connected = false
	config = new(Config)
	config.OscHost = "127.0.0.1"
	config.OscPort = 9000
	config.OscConnectedPath = "/avatar/parameters/hr_connected"
	config.OscPercentPath = "/avatar/parameters/hr_percent"
	config.WidgetId = ""
	config.MaxHeartRate = 200
	config.Timeout = 10

	if _, err := os.Stat("./config.json"); errors.Is(err, os.ErrNotExist) {
		if file, err := os.Create("./config.json"); err == nil {
			defer func() { _ = file.Close() }()

			enc := json.NewEncoder(file)
			enc.SetIndent("", "  ")
			_ = enc.Encode(config)
		}
	} else if b, err := os.ReadFile("./config.json"); err == nil {
		_ = json.Unmarshal(b, config)
	}
}

func UpdateWidgetId(widgetId string) {
	config.WidgetId = widgetId
	SaveConfig()
}

func SaveConfig() {
	if file, err := os.OpenFile("./config.json", os.O_RDWR, 0644); err == nil {
		defer func() { _ = file.Close() }()
		enc := json.NewEncoder(file)
		enc.SetIndent("", "  ")
		_ = enc.Encode(config)
	}
	select {
	case <-done:
		log.Println("already started")
		break
	default:
		go oscInit()
	}
}
