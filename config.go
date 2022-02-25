package main

import (
	"encoding/json"
	"errors"
	"os"
)

func ConfigLoader() {
	connected = false
	config = new(Config)
	config.OscHost = "127.0.0.1"
	config.OscPort = 9000
	config.OscServerHost = "127.0.0.1"
	config.OscServerPort = 9001
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
