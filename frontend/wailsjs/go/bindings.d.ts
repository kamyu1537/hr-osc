export interface go {
  "main": {
    "App": {
		GetConnected():Promise<boolean>
		GetDisplayError():Promise<string>
		GetHeartRate():Promise<number>
		GetLoading():Promise<boolean>
		SetWidgetId(arg1:string):Promise<void>
    },
  }

}

declare global {
	interface Window {
		go: go;
	}
}
