package main

import (
	"bytes"
	"encoding/json"
	"github.com/google/uuid"
	"io/ioutil"
	"net/http"
)

var rpcUrl = "https://api.stromno.com/v1/api/public/rpc"

func GetWebSocketUrl(widgetId string) (result string, err error) {
	requestId := uuid.New().String()
	if reqBytes, err := json.Marshal(RequestData{requestId, "2.0", "getWidget", RequestDataParams{WidgetId: widgetId}}); err == nil {
		if resp, err := http.Post(rpcUrl, "application/json", bytes.NewBuffer(reqBytes)); err == nil {
			defer func() { _ = resp.Body.Close() }()
			if respBytes, err := ioutil.ReadAll(resp.Body); err == nil {
				respData := new(ResponseData)
				if err = json.Unmarshal(respBytes, respData); err == nil {
					result = respData.Result.WebSocketUrl
				}
			}
		}
	}
	return
}
