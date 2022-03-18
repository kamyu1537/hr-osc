package main

import (
	"context"
	"github.com/hypebeast/go-osc/osc"
	"runtime"
)

// App application struct
type App struct {
	ctx    context.Context
	config *Config
	osc    *osc.Client
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (b *App) startup(ctx context.Context) {
	// Perform your setup here
	b.ctx = ctx
	b.config = LoadConfig()
	b.osc = osc.NewClient(b.config.OscHost, int(b.config.OscPort))
}

// domReady is called after the front-end dom has been loaded
func (b *App) domReady(_ context.Context) {
	// Add your action here
}

// shutdown is called at application termination
func (b *App) shutdown(_ context.Context) {
}

func (b *App) beforeClose(_ context.Context) bool {
	return false
}

func (b *App) GetConfig() *Config {
	return b.config
}

func (b *App) SaveConfig() {
	b.config.Save()
}

func (b *App) UpdateConfig(data string) string {
	b.config.Update(data)
	b.osc.SetIP(b.config.OscHost)
	b.osc.SetPort(int(b.config.OscPort))

	url, _ := GetWebSocketUrl(b.config.WidgetId)
	return url
}

func (b *App) GetOS() string {
	return runtime.GOOS
}

func (b *App) SendOSCBool(address string, value bool) {
	_ = b.osc.Send(osc.NewMessage(address, value))
}

func (b *App) SendOSCFloat(address string, value float32) {
	_ = b.osc.Send(osc.NewMessage(address, value))
}

func (b *App) GetWebSocketUrl() string {
	url, _ := GetWebSocketUrl(b.config.WidgetId)
	return url
}
