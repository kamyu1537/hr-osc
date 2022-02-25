package main

import (
	"bytes"
	"encoding/json"
	"github.com/google/uuid"
	"io/ioutil"
	"net/http"
)

func GetWebSocketUrl(widgetId string) string {
	requestId := uuid.New().String()
	reqBytes, err := json.Marshal(RequestData{
		requestId,
		"2.0",
		"getWidget",
		RequestDataParams{
			WidgetId: widgetId,
		},
	})
	if err != nil {
		panic(err)
	}

	resp, err := http.Post("https://pulsoid.net/v1/api/public/rpc", "application/json", bytes.NewBuffer(reqBytes))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	repBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	repData := new(ResponseData)
	err = json.Unmarshal(repBytes, repData)
	if err != nil {
		panic(err)
	}

	return repData.Result.WebSocketUrl
}
