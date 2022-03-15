package main

import (
	"embed"
	"fmt"
	"github.com/hypebeast/go-osc/osc"
	"log"

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

var (
	oscc     *osc.Client
	done     = make(chan struct{})
	oscError string
)

var loading = true

func oscInit() {
	select {
	case <-done:
		return
	default:
		break
	}

	oscError = ""
	loading = true

	ConfigLoader()
	if config.WidgetId == "" {
		oscError = "widget_id"
		return
	}

	oscc = osc.NewClient(config.OscHost, int(config.OscPort))

	url, err := GetWebSocketUrl(config.WidgetId)
	if err != nil {
		oscError = "an error occurred while getting websocket url!!"
		return
	}

	if url == "" {
		oscError = "widget_id"
		return
	}

	done = make(chan struct{})
	log.Println(fmt.Sprintf("websocket url: %s", url))
	go ConnectWebSocketServer(url)
	loading = false
}

func main() {
	go oscInit()

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:             "hr-osc",
		Width:             320,
		Height:            240,
		MinWidth:          320,
		MinHeight:         240,
		MaxWidth:          320,
		MaxHeight:         240,
		DisableResize:     true,
		Fullscreen:        false,
		Frameless:         false,
		StartHidden:       false,
		HideWindowOnClose: false,
		RGBA:              &options.RGBA{R: 33, G: 37, B: 43, A: 255},
		Assets:            assets,
		LogLevel:          logger.DEBUG,
		OnStartup:         app.startup,
		OnDomReady:        app.domReady,
		OnShutdown:        app.shutdown,
		Bind: []interface{}{
			app,
		},
		// Windows platform specific options
		Windows: &windows.Options{
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
			DisableWindowIcon:    false,
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
