const ngrokKey = 'e0c12be5';
const emojiMap = {
  Windy: '🌪',
  'Partly Cloudy': '⛅️',
  Sunny: '☀️',
  Clear: '🌙',
  Cloudy: '☁️',
  Fog: '🌫',
  Rain: '☔️',
  Snow: '⛄️',
};
const timeMap = {};
for (let i = 0; i < 24; i++) {
  timeMap['' + i] = (i % 12) + (i >= 12 ? 'PM' : 'AM');
}
timeMap['0'] = '12AM';
timeMap['12'] = '12PM';
const spec = data => ({
  $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
  config: {
    view: { stroke: '' },
  },
  width: 1250,
  height: 500,
  data: { values: data },
  transform: [
    { calculate: 'datum.weather !== null', as: 'valid' },
    { filter: { field: 'valid', equal: true } },
    { calculate: JSON.stringify(emojiMap) + '[datum.weather]', as: 'emoji' },
    { calculate: JSON.stringify(timeMap) + '[datum.time]', as: 'time' },
  ],
  encoding: {
    x: {
      field: 'time',
      type: 'nominal',
      axis: {
        // title: 'Time',
        // titleFontSize: 50,
        // titlePadding: 25,
        title: '',
        labelAngle: 0,
        labelFontSize: 30,
        labelPadding: 15,
        labelBaseline: 'bottom',
        ticks: false,
        domain: false,
        orient: 'top',
      },
      sort: { field: 'order', op: 'min', order: 'ascending' },
    },
    y: {
      field: 'city',
      type: 'nominal',
      axis: {
        // title: 'City',
        // titleFontSize: 50,
        // titlePadding: 25,
        title: '',
        labelFontSize: 20,
        labelPadding: 15,
        ticks: false,
        domain: false,
      },
    },
  },
  layer: [
    {
      mark: { type: 'text', baseline: 'middle' },
      encoding: {
        text: { field: 'emoji', type: 'nominal' },
        size: { value: 50 },
      },
    },
    {
      mark: { type: 'text', baseline: 'middle', dy: 25 },
      encoding: {
        text: { field: 'types', type: 'nominal' },
        size: { value: 8 },
      },
    },
  ],
});
const render = () => {
  let xhttp = new XMLHttpRequest();
  let jsonText;
  xhttp.open('GET', 'https://' + ngrokKey + '.ngrok.io/weather.php', false);
  xhttp.onreadystatechange = () => {
    if (xhttp.readyState === 4)
      if (xhttp.status === 200 || xhttp.status === 0) jsonText = xhttp.responseText;
  };
  xhttp.send(null);
  var data = JSON.parse(jsonText);
  const parseSpec = vega.parse(vl.compile(spec(data)).spec);
  new vega.View(parseSpec)
    .renderer('svg')
    .initialize('#vis')
    .run();
};
const d = new Date();
const date = document.getElementById('date');
date.innerHTML = d.toString();
render();
setInterval(render, 120000);
