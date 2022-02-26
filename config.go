package main

import (
	"encoding/json"
	"errors"
	"os"
)

var config *Config

func init() {
	ConfigLoader()
}

func ConfigLoader() {
	connected = false
	config = new(Config)
	config.OscHost = "127.0.0.1"
	config.OscPort = 9000
	config.OscConnectedPath = "/avatar/parameters/hr_connected"
	config.OscPercentPath = "/avatar/parameters/hr_percent"
	config.WidgetId = ""
	config.MaxHeartRate = 200
	config.Timeout = 5

	if _, err := os.Stat("./config.json"); errors.Is(err, os.ErrNotExist) {
		if file, err := os.Create("./config.json"); err != nil {
			panic(err)
		} else {
			defer func() { _ = file.Close() }()

			enc := json.NewEncoder(file)
			enc.SetIndent("", "  ")
			_ = enc.Encode(config)
		}
	} else if b, err := os.ReadFile("./config.json"); err == nil {
		_ = json.Unmarshal(b, config)
	}
}
