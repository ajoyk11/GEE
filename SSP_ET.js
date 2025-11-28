var aoi = ee.Geometry.Rectangle([77.75, 32.25, 79.5, 34.75])
Map.centerObject(aoi)
Map.addLayer(aoi)

var modelList = ["CanESM5", "GFDL-ESM4"] //check other at the data about

var scenarios_future = ["ssp245", "ssp585"]
var scenario_hist = ["historical"]

// Astronomical Radiation
function extraterrestrialRadiation(date, latDeg) {

  latDeg = ee.Number(latDeg);
  var latRad = latDeg.multiply(Math.PI).divide(180)

  var doy  = ee.Number.parse(date.format("D"))
  var year = ee.Number.parse(date.format("YYYY"))

  var nday = ee.Number(
    ee.Algorithms.If(
      year.mod(400).eq(0)
      .or(year.mod(4).eq(0).and(year.mod(100).neq(0))),
      366, 365)
  )

  var f = doy.multiply(2*Math.PI).divide(nday)

  var gsc = 0.082;  // MJ/m²/min
  var dr  = ee.Number(1).add(ee.Number(0.033).multiply(f.cos()))
  var sda = ee.Number(0.409).multiply(f.subtract(1.39).sin())

  var arg = latRad.tan().multiply(sda.tan()).multiply(-1).clamp(-1,1)
  var sha = arg.acos()

  return ee.Number(1440).divide(Math.PI)
           .multiply(gsc)
           .multiply(dr)
           .multiply(
              sha.multiply(latRad.sin()).multiply(sda.sin())
              .add(sha.sin().multiply(latRad.cos()).multiply(sda.cos()))
           )
}

// Hargreaves ET0 (Kelvin to Celsius inside)
function computeET0(tminK, tmaxK, date, lat) {

  var tmin = tminK.subtract(273.15)
  var tmax = tmaxK.subtract(273.15)
  var tmean = tmin.add(tmax).divide(2)

  var Ra = extraterrestrialRadiation(date, lat)
  var td = tmax.subtract(tmin).max(0).sqrt()

  return ee.Number(0.0023)
      .multiply(Ra.divide(2.45))
      .multiply(td)
      .multiply(tmean.add(17.8))
      .max(0)
}

// Universal Model Processor
var basinLat = aoi.centroid().coordinates().get(1)

function extractTimeseries(modelName, scenario, useYearFilter) {

  print("Processing:", modelName, "| Scenario:", scenario)

  var ds = ee.ImageCollection("NASA/GDDP-CMIP6")
              .filter(ee.Filter.eq("model", modelName))
              .filter(ee.Filter.eq("scenario", scenario))
              .select(["tasmin","tasmax","pr"])

  if (useYearFilter) {
    ds = ds.filter(ee.Filter.calendarRange(2015, 2100, "year"));//startYear and end year
  }

  var ts = ds.map(function(img) {

    var stats = img.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: aoi,
      scale: 27500,
      maxPixels: 1e13
    })

    var tmin = ee.Number(stats.get("tasmin"))
    var tmax = ee.Number(stats.get("tasmax"))

    // Precipitation unit Conversion [ kg/m2/s to mm/day]

    var pr_kg_m2_s = ee.Number(stats.get("pr"))
    var pr_mm_day  = pr_kg_m2_s.multiply(86400)

    var et0 = computeET0(tmin, tmax, img.date(), basinLat)

    return ee.Feature(null, {
      date: img.date().format("YYYY-MM-dd"),
      tasmin: tmin.subtract(273.15),
      tasmax: tmax.subtract(273.15),
      pr: pr_mm_day,
      et0: et0
    })
  })

  Export.table.toDrive({
    collection: ts,
    description: modelName + "_" + scenario + "_Changthang",
    fileFormat: "CSV",
    folder: "Climate_Data"
  })
}
// SSP Scenarions(SSP245 & SSP585)
modelList.forEach(function(modelName){scenarios_future.forEach(function(scn){extractTimeseries(modelName, scn, true);});})
// Historical Run
modelList.forEach(function(modelName) {extractTimeseries(modelName, scenario_hist, false);})
