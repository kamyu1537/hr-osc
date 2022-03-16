package client

import (
	"encoding/json"
	"errors"
	"os"
	"sync"
)

type Config struct {
	OscHost          string `json:"osc_client_host"`
	OscPort          uint16 `json:"osc_client_port"`
	OscConnectedPath string `json:"osc_path_connected"`
	OscPercentPath   string `json:"osc_path_percent"`
	MaxHeartRate     int    `json:"max_heart_rate"`
	WidgetId         string `json:"widget_id"`
	Timeout          int    `json:"timeout"`
}

var config *Config
var configOnce sync.Once

func LoadConfig() {
	configOnce.Do(func() {
		config = new(Config)
		config.OscHost = "127.0.0.1"
		config.OscPort = 9000
		config.OscConnectedPath = "/avatar/parameters/hr_connected"
		config.OscPercentPath = "/avatar/parameters/hr_percent"
		config.WidgetId = ""
		config.MaxHeartRate = 200
		config.Timeout = 10
	})

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

func GetConfig() *Config {
	return config
}

func (c *Config) Apply() {
	// OSC Client SetIP and Port
	if oscClient != nil {
		oscClient.SetIP(c.OscHost)
		oscClient.SetPort(int(c.OscPort))
	}
}

func (c *Config) Save() {
	if file, err := os.OpenFile("./config.json", os.O_RDWR, 0644); err == nil {
		defer func() { _ = file.Close() }()
		enc := json.NewEncoder(file)
		enc.SetIndent("", "  ")
		_ = enc.Encode(c)
	}

	c.Apply()
	go Init()
}

func (c *Config) SetWidgetId(widgetId string) {
	config.WidgetId = widgetId
	c.Save()
}
