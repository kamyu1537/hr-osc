package main

import (
	"fmt"
	"os"
)

func ExitProgram(msg string) {
	fmt.Println(msg)
	fmt.Println("press 'enter' to exit this program")
	_, _ = fmt.Scanln()
	os.Exit(0)
}
