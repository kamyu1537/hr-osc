package main

import (
	"embed"
	"log"
	"runtime"

	"github.com/wailsapp/wails/v2/pkg/options/mac"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

var app *App

func main() {
	runtime.GOMAXPROCS(2)

	frameless := true
	if runtime.GOOS == "darwin" {
		frameless = false
	}

	// Create an instance of the app structure
	app = NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "hr-osc",
		Width:             300,
		Height:            255,
		MinWidth:          300,
		MinHeight:         255,
		MaxWidth:          300,
		MaxHeight:         255,
		DisableResize:     true,
		Fullscreen:        false,
		Frameless:         frameless,
		StartHidden:       false,
		HideWindowOnClose: false,
		RGBA:              &options.RGBA{R: 33, G: 37, B: 43, A: 255},
		Assets:            assets,
		LogLevel:          logger.DEBUG,
		OnStartup:         app.startup,
		OnDomReady:        app.domReady,
		OnShutdown:        app.shutdown,
		OnBeforeClose:     app.beforeClose,
		AlwaysOnTop:       true,
		Bind: []interface{}{
			app,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  true,
			DisableWindowIcon:    true,
		},
		Mac: &mac.Options{
			TitleBar:             mac.TitleBarHiddenInset(),
			Appearance:           mac.NSAppearanceNameDarkAqua,
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			About: &mac.AboutInfo{
				Title:   "hr-osc",
				Message: "© 2021 kamyu1537",
				Icon:    icon,
			},
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
