package client

import (
	"context"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"log"

	"github.com/hypebeast/go-osc/osc"
)

var (
	appContext       *context.Context
	oscClient        *osc.Client
	wsCloseChannel   chan struct{}
	DisplayError     = ""
	Loading          = true
	IsConnected      = false
	HeartRate        = int64(0)
	HeartRatePercent = float64(0)
)

func Startup(ctx *context.Context) {
	LoadConfig()
	appContext = ctx
	oscClient = osc.NewClient(config.OscHost, int(config.OscPort))

	Init()
}

func Init() {
	// 서버가 활성화 되어있음
	select {
	case <-wsCloseChannel:
		log.Println("already started")
		return
	default:
		break
	}

	wsCloseChannel = make(chan struct{})
	setDisplayError("")
	setLoading(true)

	if config.WidgetId == "" {
		setDisplayError("widget_id")
		return
	}

	url, err := GetWebSocketUrl(config.WidgetId)
	if err != nil {
		setDisplayError("an error occurred while getting websocket url!")
		return
	}

	if url == "" {
		setDisplayError("widget_id")
		return
	}

	log.Printf("websocket url: %s\n", url)
	go ConnectWebSocketServer(url)
	setLoading(false)
}

func Close() {
	close(wsCloseChannel)
}

func setDisplayError(err string) {
	DisplayError = err
	runtime.EventsEmit(*appContext, "onChangeDisplayError", DisplayError)
	log.Printf("DisplayError: %s\n", DisplayError)
}

func setLoading(loading bool) {
	Loading = loading
	runtime.EventsEmit(*appContext, "onChangeLoading", Loading)
	log.Printf("Loading: %t\n", Loading)
}

func setConnected(conn bool) {
	IsConnected = conn
	_ = oscClient.Send(osc.NewMessage(config.OscConnectedPath, conn))
	runtime.EventsEmit(*appContext, "onChangeConnected", IsConnected)
	log.Printf("Connected: %t\n", IsConnected)
}

func setHeartRate(heartRate int64) {
	HeartRate = heartRate
	runtime.EventsEmit(*appContext, "onChangeHeartRate", HeartRate)
	log.Printf("HeartRate: %d\n", HeartRate)
}

func setHeartRatePercent(heartRatePercent float64) {
	HeartRatePercent = heartRatePercent
	runtime.EventsEmit(*appContext, "onChangeHeartRatePercent", heartRatePercent)
	log.Printf("HeartRate Percent: %.2f\n", heartRatePercent)
}
