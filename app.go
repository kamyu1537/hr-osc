package main

import (
	"context"
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
}

// domReady is called after the front-end dom has been loaded
func (b *App) domReady(ctx context.Context) {
	// Add your action here
}

// shutdown is called at application termination
func (b *App) shutdown(ctx context.Context) {
	// Perform your teardown here
	close(done)
}

func (b *App) IsLoading() bool {
	return loading
}

func (b *App) WebSocketConnectionStatus() bool {
	return connected
}

func (b *App) CurrentHeartRate() int64 {
	return heartRate
}

func (b *App) GetError() string {
	return oscError
}

func (b *App) SetWidgetId(widgetId string) {
	UpdateWidgetId(widgetId)
}
