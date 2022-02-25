package main

import (
	"fmt"
	"github.com/hypebeast/go-osc/osc"
)

func OscParameterReceiver(handler osc.HandlerFunc) {
	d := osc.NewStandardDispatcher()
	if err := d.AddMsgHandler("/avatar/change", handler); err != nil {
		panic(err)
	}

	server := &osc.Server{
		Addr:       fmt.Sprintf("%s:%d", config.OscServerHost, config.OscServerPort),
		Dispatcher: d,
	}
	if err := server.ListenAndServe(); err != nil {
		panic(err)
	}
}
