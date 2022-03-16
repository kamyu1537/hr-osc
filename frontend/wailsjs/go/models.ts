/* Do not change, this code is generated from Golang structs */

export {};

export class Config {
    osc_client_host: string;
    osc_client_port: number;
    osc_path_connected: string;
    osc_path_percent: string;
    max_heart_rate: number;
    widget_id: string;
    timeout: number;

    static createFrom(source: any = {}) {
        return new Config(source);
    }

    constructor(source: any = {}) {
        if ('string' === typeof source) source = JSON.parse(source);
        this.osc_client_host = source["osc_client_host"];
        this.osc_client_port = source["osc_client_port"];
        this.osc_path_connected = source["osc_path_connected"];
        this.osc_path_percent = source["osc_path_percent"];
        this.max_heart_rate = source["max_heart_rate"];
        this.widget_id = source["widget_id"];
        this.timeout = source["timeout"];
    }
}