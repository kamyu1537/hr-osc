# HR-OSC
Stromno HeartRate Client for VRChat OSC

## Environment
* Go 1.18
* NodeJS 16.x (LTS)
* Svelte 3

## Requirement
* wails v2 CLI
```shell
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

## Development
```shell
# svelte npm package install
cd frontend
npm install
cd ..

# wails live development
wails dev
```

## Build
```shell
wails build
```
