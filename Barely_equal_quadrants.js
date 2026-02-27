var aoi_fc = ee.FeatureCollection('projects/......');
var aoi    = aoi_fc.geometry();

var bounds  = aoi_fc.bounds().coordinates().get(0);
var mnLon   = ee.List(ee.List(bounds).get(0)).getNumber(0).getInfo();
var mnLat   = ee.List(ee.List(bounds).get(0)).getNumber(1).getInfo();
var mxLon   = ee.List(ee.List(bounds).get(2)).getNumber(0).getInfo();
var mxLat   = ee.List(ee.List(bounds).get(2)).getNumber(1).getInfo();
var tArea   = aoi.area().getInfo();

print('Total area (km²):',         tArea/1e6);
print('Target per quadrant (km²):', tArea/4/1e6);

// ── Binary search lon ──
var lo = mnLon, hi = mxLon;
for (var i = 0; i < 40; i++) {
  var mid = (lo + hi) / 2;
  var wa = aoi.intersection(ee.Geometry.Rectangle([mnLon, mnLat, mid, mxLat])).area().getInfo();
  if (wa < tArea/2) lo = mid; else hi = mid;
}
var split_lon = (lo + hi) / 2;

// ── Binary search lat ──
lo = mnLat; hi = mxLat;
for (var j = 0; j < 10; j++) {
  var mid = (lo + hi) / 2;
  var sa = aoi.intersection(ee.Geometry.Rectangle([mnLon, mnLat, mxLon, mid])).area().getInfo();
  if (sa < tArea/2) lo = mid; else hi = mid;
}
var split_lat = (lo + hi) / 2;

print('Split lon:', split_lon);
print('Split lat:', split_lat);

// ── Quadrants ──
var aoi_NW = aoi.intersection(ee.Geometry.Rectangle([mnLon,     split_lat, split_lon, mxLat     ]));
var aoi_SW = aoi.intersection(ee.Geometry.Rectangle([mnLon,     mnLat,     split_lon, split_lat ]));
var aoi_NE = aoi.intersection(ee.Geometry.Rectangle([split_lon, split_lat, mxLon,     mxLat     ]));
var aoi_SE = aoi.intersection(ee.Geometry.Rectangle([split_lon, mnLat,     mxLon,     split_lat ]));

var q = tArea / 4;
[['NW', aoi_NW], ['NE', aoi_NE], ['SW', aoi_SW], ['SE', aoi_SE]].forEach(function(p) {
  var a = p[1].area().getInfo();
  print('aoi_' + p[0] + ': ' + (a/1e6).toFixed(0) + ' km²  (' + (100*(a-q)/q).toFixed(1) + '%)');
});

// ── Visualize ──
Map.centerObject(aoi, 8);
Map.addLayer(aoi,    {},              'AOI');
Map.addLayer(aoi_NW, {color:'cyan'},    'NW');
Map.addLayer(aoi_NE, {color:'magenta'}, 'NE');
Map.addLayer(aoi_SW, {color:'lime'},    'SW');
Map.addLayer(aoi_SE, {color:'orange'},  'SE');
Map.addLayer(ee.Geometry.LineString([[split_lon, mnLat], [split_lon, mxLat]]), {color:'red'},  'V Split');
Map.addLayer(ee.Geometry.LineString([[mnLon, split_lat], [mxLon, split_lat]]), {color:'blue'}, 'H Split');
