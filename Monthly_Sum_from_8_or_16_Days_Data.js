var aoi = ee.FeatureCollection('projects/ajoyiirs/assets/________');
var Collecxtion = ee.ImageCollection("______________________")
.filterBounds(aoi)
.filterDate('2025-01-01', '2025-08-01')
.select('BAND');
print(img)



var startYear = 2000;
var endYear = 2025;
var bandName = "GPP";

var monthBandList = ee.List([]);

for (var yr = startYear; yr <= endYear; yr++) {
  for (var mo = 1; mo <= 12; mo++) {
    var start = ee.Date.fromYMD(yr, mo, 1);
    var end = start.advance(1, "month");
    var filtered = Collection.filterDate(start, end).select(bandName); 
    var count = filtered.size();

    var bandLabel = 'GPP_' + yr + '_' + (mo < 10 ? '0' + mo : mo);

    // Force ALL bands to Float32
    var monthlyImg = ee.Image(
      ee.Algorithms.If(
        count.gt(0), 
        filtered.sum().toFloat().rename([bandLabel]),  //  Float32
        ee.Image(0).toFloat().rename([bandLabel])      //  Float32
      )
    );
    monthBandList = monthBandList.add(monthlyImg);
  }
}
var monthlyBandImage = ee.ImageCollection.fromImages(monthBandList).toBands().clip(aoi);
