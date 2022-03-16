package main

import (
	"context"
	"hr-osc/client"
	"runtime"
)

// App application struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (b *App) startup(ctx context.Context) {
	// Perform your setup here
	b.ctx = ctx
	go client.Startup(&ctx)
}

// domReady is called after the front-end dom has been loaded
func (b *App) domReady(ctx context.Context) {
	// Add your action here
}

// shutdown is called at application termination
func (b *App) shutdown(ctx context.Context) {
	// Perform your teardown here
	client.Close()
}

func (b *App) beforeClose(ctx context.Context) bool {
	return false
}

func (b *App) GetLoading() bool {
	return client.Loading
}

func (b *App) GetConnected() bool {
	return client.IsConnected
}

func (b *App) GetHeartRate() int64 {
	return client.HeartRate
}

func (b *App) GetHeartRatePercent() float64 {
	return client.HeartRatePercent
}

func (b *App) GetDisplayError() string {
	return client.DisplayError
}

func (b *App) GetConfig() *client.Config {
	return client.GetConfig()
}

func (b *App) SaveConfig() {
	client.GetConfig().Save()
}

func (b *App) SetWidgetId(widgetId string) {
	client.GetConfig().SetWidgetId(widgetId)
}

func (b *App) SetMaxHeartRate(maxHeartRate int) {
	client.GetConfig().SetMaxHeartRate(maxHeartRate)
}

func (b *App) SetConnectedParameterName(parameterName string) {
	client.GetConfig().SetConnectedParameterName(parameterName)
}

func (b *App) SetPercentParameterName(parameterName string) {
	client.GetConfig().SetPercentParameterName(parameterName)
}

func (b *App) GetOS() string {
	return runtime.GOOS
}
