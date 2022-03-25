export interface go {
  "main": {
    "App": {
		GetConfig():Promise<Config>
		GetOS():Promise<string>
		GetWebSocketUrl():Promise<string>
		SaveConfig():Promise<void>
		SendOSCBool(arg1:string,arg2:boolean):Promise<void>
		SendOSCFloat(arg1:string,arg2:number):Promise<void>
		UpdateConfig(arg1:string):Promise<string>
    },
  }

}

declare global {
	interface Window {
		go: go;
	}
}
