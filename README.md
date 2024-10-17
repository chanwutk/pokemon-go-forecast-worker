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
Using Crontab
```bash
crontab -e
```
Then, paste this code
```bash
# need to sleep because the network might not be ready when the scrip starts.
@reboot sleep 60 && /bin/bash /path/to/pokemon-go-forecast-worker/start-worker.sh
```
