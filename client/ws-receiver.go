package client

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
	"github.com/hypebeast/go-osc/osc"
	"log"
	"math"
	"time"
)

type WebSocketReceiveMessage struct {
	Timestamp int64                `json:"timestamp"`
	Data      WebSocketReceiveData `json:"data"`
}

type WebSocketReceiveData struct {
	HeartRate int64 `json:"heartRate"`
}

func ConnectToWebSocketServer(address string) {
	wsCloseChannel = make(chan struct{})

	log.Println("connection to stromno websocket server")
	wsContext, wsCancel := context.WithCancel(context.TODO())
	defer func() { wsCancel() }()
	conn, _, _, err := ws.DefaultDialer.Dial(wsContext, address)
	if err != nil {
		setDisplayError(fmt.Sprintf("ws connect: %s", err.Error()))
		return
	}
	defer func() {
		recover()
		_ = conn.Close()
	}()

	_ = conn.SetDeadline(time.Time{})
	_ = conn.SetReadDeadline(time.Time{})
	_ = conn.SetWriteDeadline(time.Time{})

	reader := wsutil.NewClientSideReader(conn)

	setConnected(false)

	timer := time.NewTimer(0)
	go receiveTimeout(timer)

messageReceiveLoop:
	for {
		select {
		case <-wsCloseChannel:
			_ = conn.Close()
			break messageReceiveLoop
		case <-wsContext.Done():
			if wsContext.Err() != nil {
				setDisplayError(wsContext.Err().Error())
			}
			break messageReceiveLoop
		default:
		}

		_, err := reader.NextFrame()
		if err != nil {
			setDisplayError(fmt.Sprintf("ws message: %s", err.Error()))
			close(wsCloseChannel)
			break
		}

		data, err := wsutil.ReadServerText(conn)
		if err != nil {
			setDisplayError(fmt.Sprintf("ws message: %s", err.Error()))
			continue
		}

		var msg WebSocketReceiveMessage
		err = json.Unmarshal(data, &msg)
		if err != nil {
			setDisplayError(fmt.Sprintf("ws message: %s", err.Error()))
			continue
		}

		setHeartRate(msg.Data.HeartRate)
		heartRatePercent := float64(msg.Data.HeartRate) / float64(config.MaxHeartRate)
		heartRatePercent *= 100
		heartRatePercent = math.Floor(heartRatePercent)
		heartRatePercent *= 0.01

		setHeartRatePercent(heartRatePercent)
		_ = oscClient.Send(osc.NewMessage(config.OscPercentPath, float32(heartRatePercent)))
		timer.Reset(time.Second * time.Duration(config.Timeout))
		setConnected(true)
	}

	select {
	case <-(*appContext).Done():
		return
	case <-wsCloseChannel:
		Init()
		break
	default:
	}
}

func receiveTimeout(timer *time.Timer) {
	for {
		<-timer.C
		if IsConnected == true {
			setConnected(false)
			log.Println("websocket disconnected")
		}
	}
}
