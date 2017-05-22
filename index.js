const _ = require('lodash');
const geolib = require('geolib');

// const MEGACITY_POPULATION = 4000000;
// const LARGE_CITY_POPULATION = 500000 - 4000000
// const MEDIUM_CITY_POPULATION = 25000 - 500000
// const SMALL_CITY_POPULATION = 0 - 25000

function isLayer(layer, result) {
  return result.layer === layer;
}

const isLocality = isLayer.bind(null, 'locality');
const isCountry = isLayer.bind(null, 'country');
const isDependency = isLayer.bind(null, 'dependency');
const isMacroRegion = isLayer.bind(null, 'macroregion');
const isRegion = isLayer.bind(null, 'region');
const isMacroCounty = isLayer.bind(null, 'macrocounty');
const isCounty = isLayer.bind(null, 'county');
const isBorough = isLayer.bind(null, 'borough');
const isNeighbourhood = isLayer.bind(null, 'neighbourhood');

function eitherIsLayer(layer, result1, result2) {
  return isLayer(layer, result1) || isLayer(layer, result2);
}

const eitherIsCountry = eitherIsLayer.bind(null, 'country');
const eitherIsDependency = eitherIsLayer.bind(null, 'dependency');
const eitherIsMacroRegion = eitherIsLayer.bind(null, 'macroregion');
const eitherIsRegion = eitherIsLayer.bind(null, 'region');
const eitherIsMacroCounty = eitherIsLayer.bind(null, 'macrocounty');
const eitherIsCounty = eitherIsLayer.bind(null, 'county');
const eitherIsBorough = eitherIsLayer.bind(null, 'borough');
const eitherIsNeighbourhood = eitherIsLayer.bind(null, 'neighbourhood');

const isMegaSize = _.partialRight(_.inRange, 4000000, Infinity);
const isLargeSize = _.partialRight(_.inRange, 500000, 4000000);
const isMediumSize = _.partialRight(_.inRange, 5000, 500000);
const isSmallSize = _.partialRight(_.inRange, 0, 5000);

const isPopular = _.partialRight(_.inRange, 1000, Infinity);
const isNonPopular = _.partialRight(_.inRange, 0, 1000);

function isMegaCity(result) {
  return isLocality(result) && isMegaSize(_.defaultTo(result.population, 0));
}

function isLargeCity(result) {
  return isLocality(result) && isLargeSize(_.defaultTo(result.population, 0));
}

function isMediumCity(result) {
  return isLocality(result) && isMediumSize(_.defaultTo(result.population, 0));
}

function isSmallCity(result) {
  return isLocality(result) && isSmallSize(_.defaultTo(result.population, 0));
}

function isPopularNeighbourhood(result) {
  return isNeighbourhood(result) && isPopular(_.defaultTo(result.popularity, 0));
}

function isNonPopularNeighbourhood(result) {
  return isNeighbourhood(result) && isNonPopular(_.defaultTo(result.popularity, 0));
}

function resolve(isA, result1, result2) {
  if (isA(result1)) {
    if (isA(result2)) {
      return _.defaultTo(result2.population, 0) - _.defaultTo(result1.population, 0);
    }
    return -1;
  }
  return 1;
}

const resolveMegaCity = resolve.bind(null, isMegaCity);
const resolveCountry = resolve.bind(null, isCountry);
const resolveDependency = resolve.bind(null, isDependency);
const resolveMacroRegion = resolve.bind(null, isMacroRegion);
const resolveRegion = resolve.bind(null, isRegion);
const resolveMacroCounty = resolve.bind(null, isMacroCounty);
const resolveCounty = resolve.bind(null, isCounty);
const resolveBorough = resolve.bind(null, isBorough);
const resolveNeighbourhood = resolve.bind(null, isNeighbourhood);

function resolveMediumCity(result1, result2, focus_point) {
  if (isMediumCity(result1)) {
    if (isMediumCity(result2)) {
      if (focus_point) {
        const lat_lon_1 = parse_lat_lon(result1.center_point, 'lat', 'lon');
        const lat_lon_2 = parse_lat_lon(result2.center_point, 'lat', 'lon');

        if (lat_lon_1 && lat_lon_2) {
          const distance_1 = geolib.getDistance(focus_point, lat_lon_1);
          const distance_2 = geolib.getDistance(focus_point, lat_lon_2);

          return distance_1 - distance_2;

        } else if (lat_lon_1) {
          return -1;
        } else {
          return 1;
        }

      }

      return result2.population - result1.population;

    }
    return -1;
  }
  return 1;
}

function resolveLargeCity(result1, result2, focus_point) {
  if (isLargeCity(result1)) {
    if (isLargeCity(result2)) {
      if (focus_point) {
        const lat_lon_1 = parse_lat_lon(result1.center_point, 'lat', 'lon');
        const lat_lon_2 = parse_lat_lon(result2.center_point, 'lat', 'lon');

        if (lat_lon_1 && lat_lon_2) {
          const distance_1 = geolib.getDistance(focus_point, lat_lon_1);
          const distance_2 = geolib.getDistance(focus_point, lat_lon_2);

          return distance_1 - distance_2;

        } else if (lat_lon_1) {
          return -1;
        } else {
          return 1;
        }

      }

      return result2.population - result1.population;

    }
    return -1;
  }
  return 1;
}

function resolveSmallCity(result1, result2, focus_point) {
  if (isSmallCity(result1)) {
    if (isSmallCity(result2)) {
      if (focus_point) {
        const lat_lon_1 = parse_lat_lon(result1.center_point, 'lat', 'lon');
        const lat_lon_2 = parse_lat_lon(result2.center_point, 'lat', 'lon');

        if (lat_lon_1 && lat_lon_2) {
          const distance_1 = geolib.getDistance(focus_point, lat_lon_1);
          const distance_2 = geolib.getDistance(focus_point, lat_lon_2);

          return distance_1 - distance_2;

        } else if (lat_lon_1) {
          return -1;
        } else {
          return 1;
        }

      }

      return result2.population - result1.population;

    }
    return -1;
  }
  return 1;
}

function resolvePopularNeighbourhood(result1, result2, focus_point) {
  if (isPopularNeighbourhood(result1)) {
    if (isPopularNeighbourhood(result2)) {
      if (focus_point) {
        const lat_lon_1 = parse_lat_lon(result1.center_point, 'lat', 'lon');
        const lat_lon_2 = parse_lat_lon(result2.center_point, 'lat', 'lon');

        if (lat_lon_1 && lat_lon_2) {
          const distance_1 = geolib.getDistance(focus_point, lat_lon_1);
          const distance_2 = geolib.getDistance(focus_point, lat_lon_2);

          return distance_1 - distance_2;

        } else if (lat_lon_1) {
          return -1;
        } else {
          return 1;
        }

      }

      return result2.popularity - result1.popularity;

    }
    return -1;
  }
  return 1;
}

function resolveNonPopularNeighbourhood(result1, result2, focus_point) {
  if (isNonPopularNeighbourhood(result1)) {
    if (isNonPopularNeighbourhood(result2)) {
      if (focus_point) {
        const lat_lon_1 = parse_lat_lon(result1.center_point, 'lat', 'lon');
        const lat_lon_2 = parse_lat_lon(result2.center_point, 'lat', 'lon');

        if (lat_lon_1 && lat_lon_2) {
          const distance_1 = geolib.getDistance(focus_point, lat_lon_1);
          const distance_2 = geolib.getDistance(focus_point, lat_lon_2);

          return distance_1 - distance_2;

        } else if (lat_lon_1) {
          return -1;
        } else {
          return 1;
        }

      }

      return result2.popularity - result1.popularity;

    }
    return -1;
  }
  return 1;
}

function parse_lat_lon(obj, lat_field, lon_field) {
  if (_.has(obj, lat_field) && _.has(obj, lon_field)) {
    return { latitude: obj[lat_field], longitude: obj[lon_field] };
  }
}

module.exports = (clean) => {
  const focus_point = parse_lat_lon(clean, 'focus.point.lat', 'focus.point.lon');

  return (result1, result2) => {
    if (isMegaCity(result1) || isMegaCity(result2)) {
      return resolveMegaCity(result1, result2);
    }

    if (eitherIsCountry(result1, result2)) {
      return resolveCountry(result1, result2);
    }

    if (eitherIsDependency(result1, result2)) {
      return resolveDependency(result1, result2);
    }

    if (isLargeCity(result1) || isLargeCity(result2)) {
      return resolveLargeCity(result1, result2);
    }

    if (eitherIsMacroRegion(result1, result2)) {
      return resolveMacroRegion(result1, result2);
    }

    if (eitherIsRegion(result1, result2)) {
      return resolveRegion(result1, result2);
    }

    if (eitherIsMacroCounty(result1, result2)) {
      return resolveMacroCounty(result1, result2);
    }

    if (eitherIsBorough(result1, result2)) {
      return resolveBorough(result1, result2);
    }

    if (isMediumCity(result1) || isMediumCity(result2)) {
      return resolveMediumCity(result1, result2, focus_point);
    }

    if (eitherIsCounty(result1, result2)) {
      // rank counties lower than cities so Lancaster County, PA doesn't outrank Lancaster, PA (the city)
      // York County (PA vs SC)
      return resolveCounty(result1, result2, focus_point);
    }

    if (isPopularNeighbourhood(result1) || isPopularNeighbourhood(result2)) {
      return resolvePopularNeighbourhood(result1, result2, focus_point);
    }

    if (isSmallCity(result1) || isSmallCity(result2)) {
      return resolveSmallCity(result1, result2, focus_point);
    }

    if (isNonPopularNeighbourhood(result1) || isNonPopularNeighbourhood(result2)) {
      return resolveNonPopularNeighbourhood(result1, result2, focus_point);
    }

    return result1 < result2;

  };
};
