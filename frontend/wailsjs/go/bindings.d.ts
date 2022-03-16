export interface go {
  "main": {
    "App": {
		GetConfig():Promise<Config>
		GetConnected():Promise<boolean>
		GetDisplayError():Promise<string>
		GetHeartRate():Promise<number>
		GetHeartRatePercent():Promise<number>
		GetLoading():Promise<boolean>
		GetOS():Promise<string>
		SaveConfig():Promise<void>
		SetConnectedParameterName(arg1:string):Promise<void>
		SetMaxHeartRate(arg1:number):Promise<void>
		SetPercentParameterName(arg1:string):Promise<void>
		SetWidgetId(arg1:string):Promise<void>
    },
  }

}

declare global {
	interface Window {
		go: go;
	}
}
