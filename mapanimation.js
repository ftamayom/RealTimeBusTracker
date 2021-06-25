const colors = [
  '#f44336',
  '#4caf50',
  '#e91e63',
  '#ffc107',
  '#9c27b0',
  '#cddc39',
  '#673ab7',
  '#8bc34a',
  '#3f51b5',
  '#2196f3',
  '#ff9800',
  '#03a9f4',
  '#ff5722',
  '#00bcd4',
  '#795548',
  '#009688',
  '#9e9e9e',
  '#ffeb3b',
  '#607d8b'
]

const markers = []

mapboxgl.accessToken = 'pk.eyJ1IjoiZnRhbWF5b20iLCJhIjoiY2twcmQ1Ym9mM2Q1ZDJ4bXczNXAxZHd2aSJ9.hnK8-4QX4EuREoa7CssLPA'

let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-71.104081, 42.365554],
  zoom: 12,
})

getBusLocations = async () => {
  const url = 'https://api-v3.mbta.com/vehicles?filter[route]=1&include=trip'
  const res = await fetch(url)
  const json = await res.json()
  return json.data
}

showBusLocations = async (locations) => {
  locations.forEach(item => {
    let found = false
    for (let i = 0; i < markers.length; i++) {
      if (markers[i].id === item.id) {
        markers[i].marker.setLngLat([
          item.attributes.longitude, item.attributes.latitude
        ])

        let prevData = map.getSource(item.id)._data

        prevData.geometry.coordinates.push(
          [item.attributes.longitude, item.attributes.latitude]
        )

        map.getSource(item.id).setData(prevData);
        found = true
      }
    }

    if (!found) {
      let marker = new mapboxgl.Marker({ "color": colors[markers.length] }).setLngLat([
        item.attributes.longitude, item.attributes.latitude
      ]).addTo(map)

      map.addSource(item.id, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                  [item.attributes.longitude, item.attributes.latitude]
                ]
            }
        }
      })
    
      map.addLayer({
          'id': item.id,
          'type': 'line',
          'source': item.id,
          'layout': {
              'line-join': 'round',
              'line-cap': 'round'
          },
          'paint': {
              'line-color': colors[markers.length],
              'line-width': 8
          }
      })

      markers.push({
        id: item.id,
        marker
      })
    }

  })
}

run = async () => {
  const locations = await getBusLocations()
  showBusLocations(locations)
  setTimeout(run, 15000)
}

map.on('load', function () {
  run()
})

