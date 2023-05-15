# Pokemon Go Forecast Worker
Collect weather data from [AccuWeather](www.accuweather.com) for Pokemon Go in [Bangkok](https://goo.gl/maps/KRQ8vV3uuJn) area.

Please visite the demo [site](https://chanwutk.github.io/pokemon-go-forecast/).

## Setup

### Clone this repository and data repository
```bash
git clone git@github.com:chanwutk/pokemon-go-forecast-worker.git
git clone git@github.com:chanwutk/pokemon-go-forecast-data.git
```

### Build
```bash
cd pokemon-go-forecast-worker
npm install
npm run build
```

### Start
```bash
npm run start
```

### Autostart on raspberry pi
```bash
mkdir /home/pi/.config/autostart
vim /home/pi/.config/autostart/pokemongo.desktop
```
Then, paste this code into `pokemongo.desktop`
```bash
[Desktop Entry]
Type=Application
Name=PokemonGo
Exec=xterm -hold -e 'source .bashrc && node /home/pi/pokemon-go-forecast-worker/dist/app.js'
```
