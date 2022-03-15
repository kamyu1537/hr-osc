export interface go {
  "main": {
    "App": {
		CurrentHeartRate():Promise<number>
		GetError():Promise<string>
		IsLoading():Promise<boolean>
		SetWidgetId(arg1:string):Promise<void>
		WebSocketConnectionStatus():Promise<boolean>
    },
  }

}

declare global {
	interface Window {
		go: go;
	}
}
