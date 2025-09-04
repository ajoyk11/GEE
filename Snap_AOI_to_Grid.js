var aoi = ee.FeatureCollection('projects/ajoyiirs/assets/KaliBasin');
var geom = aoi.geometry();

var step = 0.25;

// snap a single [lon,lat] pair to the 0.25° grid
function snapPt(pt) {
  pt = ee.List(pt);                       // <-- cast!
  var lon = ee.Number(pt.get(0));
  var lat = ee.Number(pt.get(1));
  var sLon = lon.divide(step).round().multiply(step);
  var sLat = lat.divide(step).round().multiply(step);
  return ee.List([sLon, sLat]);
}

// outer ring of the AOI
var ring = ee.List(geom.coordinates().get(0));

// snap all vertices
var snappedRing = ring.map(snapPt);

// rebuild polygon (geodesic:false keeps it axis-aligned)
var snapped = ee.Geometry.Polygon([snappedRing], null, false)
  .simplify(0)                           // keep vertices as-is
  .buffer(0, 1);                         // 1 meter error margin


Map.centerObject(geom);
Map.addLayer(geom,    {color: 'black'}, 'AOI');
Map.addLayer(snapped, {color: 'red'},   'Snapped 0.25° AOI');
