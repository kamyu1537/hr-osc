package main

type Config struct {
	OscHost      string `json:"osc_host"`
	OscPort      uint16 `json:"osc_port"`
	OscPath      string `json:"osc_path"`
	MaxHeartRate int    `json:"max_heart_rate"`
	WidgetId     string `json:"widget_id"`
}

type RequestData struct {
	Id      string            `json:"id"`
	JsonRpc string            `json:"jsonrpc"`
	Method  string            `json:"method"`
	Params  RequestDataParams `json:"params"`
}

type RequestDataParams struct {
	WidgetId string `json:"widgetId"`
}

type ResponseData struct {
	Result ResponseDataResult `json:"result"`
}

type ResponseDataResult struct {
	WebSocketUrl string `json:"ramielUrl"`
}

type WebSocketReceiveMessage struct {
	Timestamp int64                `json:"timestamp"`
	Data      WebSocketReceiveData `json:"data"`
}

type WebSocketReceiveData struct {
	HeartRate int64 `json:"heartRate"`
}
