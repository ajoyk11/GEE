var aoi_fc = ee.FeatureCollection('projects/ee-ajoyiirs/assets/UttarakhandWGS84');
var aoi    = aoi_fc.geometry();

var bounds   = aoi_fc.bounds().coordinates().get(0);
var min_lon  = ee.List(ee.List(bounds).get(0)).getNumber(0);
var min_lat  = ee.List(ee.List(bounds).get(0)).getNumber(1);
var max_lon  = ee.List(ee.List(bounds).get(2)).getNumber(0);
var max_lat  = ee.List(ee.List(bounds).get(2)).getNumber(1);

var total_area = aoi.area();
print('Total area (km²):',          total_area.divide(1e6));
print('Area per quadrant (km²):',   total_area.divide(4e6));

function bsearchLon(target) {
  var lo = min_lon.getInfo(), hi = max_lon.getInfo(), t = target.getInfo();
  for (var i = 0; i < 40; i++) {
    var mid = (lo + hi) / 2;
    var w = aoi.intersection(ee.Geometry.Rectangle([lo, min_lon.getInfo(), mid, max_lon.getInfo()]));
    // use server-side values pulled client-side
    var wa = aoi.intersection(ee.Geometry.Rectangle(
      [min_lon.getInfo(), min_lat.getInfo(), mid, max_lat.getInfo()]
    )).area().getInfo();
    if (wa < t) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

function bsearchLat(half_aoi, target) {
  var lo = min_lat.getInfo(), hi = max_lat.getInfo(), t = target;
  for (var i = 0; i < 40; i++) {
    var mid = (lo + hi) / 2;
    var sa = half_aoi.intersection(ee.Geometry.Rectangle(
      [min_lon.getInfo(), min_lat.getInfo(), max_lon.getInfo(), mid]
    )).area().getInfo();
    if (sa < t) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// ── Splits ──
var mnLon = min_lon.getInfo(), mnLat = min_lat.getInfo();
var mxLon = max_lon.getInfo(), mxLat = max_lat.getInfo();
var tArea = total_area.getInfo();

var split_lon = bsearchLon(total_area.divide(2));

var aoi_W = aoi.intersection(ee.Geometry.Rectangle([mnLon, mnLat, split_lon, mxLat]));
var aoi_E = aoi.intersection(ee.Geometry.Rectangle([split_lon, mnLat, mxLon, mxLat]));

var split_lat_W = bsearchLat(aoi_W, aoi_W.area().getInfo() / 2);
var split_lat_E = bsearchLat(aoi_E, aoi_E.area().getInfo() / 2);

// Quadrants
var aoi_NW = aoi_W.intersection(ee.Geometry.Rectangle([mnLon,      split_lat_W, split_lon, mxLat      ]));
var aoi_SW = aoi_W.intersection(ee.Geometry.Rectangle([mnLon,      mnLat,       split_lon, split_lat_W]));
var aoi_NE = aoi_E.intersection(ee.Geometry.Rectangle([split_lon,  split_lat_E, mxLon,     mxLat      ]));
var aoi_SE = aoi_E.intersection(ee.Geometry.Rectangle([split_lon,  mnLat,       mxLon,     split_lat_E]));

var q = tArea / 4;
[['NW', aoi_NW], ['NE', aoi_NE], ['SW', aoi_SW], ['SE', aoi_SE]].forEach(function(p) {
  var a = p[1].area().getInfo();
  print('aoi_' + p[0] + ': ' + (a/1e6).toFixed(0) + ' km²  (' + (100*(a-q)/q).toFixed(1) + '%)');
});

//Area
Map.centerObject(aoi, 8);
Map.addLayer(aoi,{},"Aoi");
Map.addLayer(aoi_NW, {color:'cyan'},    'NW');
Map.addLayer(aoi_NE, {color:'magenta'}, 'NE');
Map.addLayer(aoi_SW, {color:'lime'},    'SW');
Map.addLayer(aoi_SE, {color:'orange'},  'SE');
Map.addLayer(ee.Geometry.LineString([[split_lon,mnLat],[split_lon,mxLat]]),        {color:'red'},    'V Split');
Map.addLayer(ee.Geometry.LineString([[mnLon,split_lat_W],[split_lon,split_lat_W]]),{color:'blue'},   'W_H');
Map.addLayer(ee.Geometry.LineString([[split_lon,split_lat_E],[mxLon,split_lat_E]]),{color:'yellow'}, 'E_H');
