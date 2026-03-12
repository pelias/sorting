const _ = require('lodash');
const geolib = require('geolib');

const populations = {
  mega: [4000000, Infinity],
  large: [500000, 4000000],
  medium: [5000, 500000],
  small: [0, 5000]
};

const popularities = {
  very_popular: [10000, Infinity],
  popular: [1000, 10000],
  nonpopular: [0, 1000]
};

function isLayer(layer, result) {
  return result.layer === layer;
}

function isLayerAndValueInRange(isLayer, field, range, result) {
  return isLayer(result) && _.inRange(_.defaultTo(result[field], 0), range[0], range[1]);
}

const isContinent = isLayer.bind(null, 'continent');
const isCountry = isLayer.bind(null, 'country');
const isDependency = isLayer.bind(null, 'dependency');
const isMacroRegion = isLayer.bind(null, 'macroregion');
const isRegion = isLayer.bind(null, 'region');
const isMacroCounty = isLayer.bind(null, 'macrocounty');
const isCounty = isLayer.bind(null, 'county');
const isLocality = isLayer.bind(null, 'locality');
const isLocaladmin = isLayer.bind(null, 'localadmin');
const isBorough = isLayer.bind(null, 'borough');
const isMacroHood = isLayer.bind(null, 'macrohood');
const isNeighbourhood = isLayer.bind(null, 'neighbourhood');
const isVenue = isLayer.bind(null, 'venue');

const isMegaLocality = isLayerAndValueInRange.bind(null, isLocality, 'population', populations.mega);
const isLargeLocality = isLayerAndValueInRange.bind(null, isLocality, 'population', populations.large);
const isMediumLocality = isLayerAndValueInRange.bind(null, isLocality, 'population', populations.medium);
const isSmallLocality = isLayerAndValueInRange.bind(null, isLocality, 'population', populations.small);

const isMegaLocaladmin = isLayerAndValueInRange.bind(null, isLocaladmin, 'population', populations.mega);
const isLargeLocaladmin = isLayerAndValueInRange.bind(null, isLocaladmin, 'population', populations.large);
const isMediumLocaladmin = isLayerAndValueInRange.bind(null, isLocaladmin, 'population', populations.medium);
const isSmallLocaladmin = isLayerAndValueInRange.bind(null, isLocaladmin, 'population', populations.small);

const isVeryPopularNeighbourhood = isLayerAndValueInRange.bind(null, isNeighbourhood, 'popularity', popularities.very_popular);
const isPopularNeighbourhood = isLayerAndValueInRange.bind(null, isNeighbourhood, 'popularity', popularities.popular);
const isNonPopularNeighbourhood = isLayerAndValueInRange.bind(null, isNeighbourhood, 'popularity', popularities.nonpopular);

function normalizeText(value) {
  if (_.isNil(value)) {
    return '';
  }
  return String(value).toLowerCase().trim();
}

function getFirstParentValue(result, key) {
  const value = _.get(result, `parent.${key}`);
  if (_.isArray(value)) {
    return value[0];
  }
  return value;
}

function mismatchPenalty(clean, result) {
  const parsedText = _.get(clean, 'parsed_text', {});
  if (_.isNil(parsedText) || _.isNil(result)) {
    return 0;
  }

  let penalty = 0;

  if (result.layer === 'address') {
    const queryPostalcode = normalizeText(parsedText.postalcode);
    const resultPostalcode = normalizeText(_.get(result, 'address_parts.zip'));

    if (queryPostalcode && resultPostalcode && queryPostalcode !== resultPostalcode) {
      penalty += 35;
    }

    const queryCity = normalizeText(parsedText.city || parsedText.locality);
    const resultLocality = normalizeText(getFirstParentValue(result, 'locality'));
    const resultLocaladmin = normalizeText(getFirstParentValue(result, 'localadmin'));

    if (queryCity && resultLocality && queryCity !== resultLocality && queryCity !== resultLocaladmin) {
      penalty += 25;
    }
  }

  return penalty;
}

function adjustedScore(clean, result) {
  const baseScore = _.defaultTo(result._score, 0);
  return baseScore - mismatchPenalty(clean, result);
}

function resolveByPopulation(isLayer, result1, result2) {
  if ([result1, result2].every(isLayer)) {
    return _.defaultTo(result2.population, 0) - _.defaultTo(result1.population, 0);
  }

  return isLayer(result1) ? -1 : 1;
}

function resolveByFocusPointThenOtherField(isLayer, field, result1, result2, focus_point) {
  if ([result1, result2].every(isLayer)) {
    if (focus_point) {
      const lat_lon_1 = parse_lat_lon(result1.center_point, 'lat', 'lon');
      const lat_lon_2 = parse_lat_lon(result2.center_point, 'lat', 'lon');

      if (lat_lon_1 && lat_lon_2) {
        const distance_1 = geolib.getDistance(focus_point, lat_lon_1);
        const distance_2 = geolib.getDistance(focus_point, lat_lon_2);

        return distance_1 - distance_2;
      }

      return lat_lon_1 ? -1 : 1;
    }

    return _.defaultTo(result2[field], 0) - _.defaultTo(result1[field], 0);
  }

  return isLayer(result1) ? -1 : 1;
}

function resolveByScore(clean, isLayer, result1, result2) {
  if ([result1, result2].every(isLayer)) {
    return adjustedScore(clean, result2) - adjustedScore(clean, result1);
  }

  return isLayer(result1) ? -1 : 1;
}

const resolveMegaLocality = resolveByPopulation.bind(null, isMegaLocality);
const resolveMegaLocaladmin = resolveByPopulation.bind(null, isMegaLocaladmin);
const resolveContinent = resolveByPopulation.bind(null, isContinent);
const resolveCountry = resolveByPopulation.bind(null, isCountry);
const resolveDependency = resolveByPopulation.bind(null, isDependency);
const resolveMacroRegion = resolveByPopulation.bind(null, isMacroRegion);
const resolveRegion = resolveByPopulation.bind(null, isRegion);
const resolveMacroCounty = resolveByPopulation.bind(null, isMacroCounty);
const resolveCounty = resolveByPopulation.bind(null, isCounty);
const resolveBorough = resolveByPopulation.bind(null, isBorough);
const resolveMacroHood = resolveByPopulation.bind(null, isMacroHood);

const resolveLargeLocality = resolveByFocusPointThenOtherField.bind(null, isLargeLocality, 'population');
const resolveMediumLocality = resolveByFocusPointThenOtherField.bind(null, isMediumLocality, 'population');
const resolveSmallLocality = resolveByFocusPointThenOtherField.bind(null, isSmallLocality, 'population');

const resolveLargeLocaladmin = resolveByFocusPointThenOtherField.bind(null, isLargeLocaladmin, 'population');
const resolveMediumLocaladmin = resolveByFocusPointThenOtherField.bind(null, isMediumLocaladmin, 'population');
const resolveSmallLocaladmin = resolveByFocusPointThenOtherField.bind(null, isSmallLocaladmin, 'population');

const resolveVeryPopularNeighbourhood = resolveByFocusPointThenOtherField.bind(null, isVeryPopularNeighbourhood, 'popularity');
const resolvePopularNeighbourhood = resolveByFocusPointThenOtherField.bind(null, isPopularNeighbourhood, 'popularity');
const resolveNonPopularNeighbourhood = resolveByFocusPointThenOtherField.bind(null, isNonPopularNeighbourhood, 'popularity');

function parse_lat_lon(obj, lat_field, lon_field) {
  if ([lat_field, lon_field].every(_.has.bind(null, obj))) {
    return { latitude: obj[lat_field], longitude: obj[lon_field] };
  }
}

module.exports = (clean) => {
  const focus_point = parse_lat_lon(clean, 'focus.point.lat', 'focus.point.lon');
  const resolveVenue = resolveByScore.bind(null, clean, isVenue);

  const fallbacks = [
    { either: isMegaLocality, resolve: resolveMegaLocality },
    { either: isMegaLocaladmin, resolve: resolveMegaLocaladmin },
    { either: isContinent, resolve: resolveContinent },
    { either: isCountry, resolve: resolveCountry },
    { either: isDependency, resolve: resolveDependency },
    { either: isLargeLocality, resolve: resolveLargeLocality },
    { either: isLargeLocaladmin, resolve: resolveLargeLocaladmin },
    { either: isMacroRegion, resolve: resolveMacroRegion },
    { either: isRegion, resolve: resolveRegion },
    { either: isBorough, resolve: resolveBorough },
    { either: isVeryPopularNeighbourhood, resolve: resolveVeryPopularNeighbourhood },
    { either: isMediumLocality, resolve: resolveMediumLocality },
    { either: isMediumLocaladmin, resolve: resolveMediumLocaladmin },
    { either: isMacroCounty, resolve: resolveMacroCounty },
    { either: isCounty, resolve: resolveCounty },
    { either: isMacroHood, resolve: resolveMacroHood },
    { either: isVenue, resolve: resolveVenue },
    { either: isPopularNeighbourhood, resolve: resolvePopularNeighbourhood },
    { either: isSmallLocality, resolve: resolveSmallLocality },
    { either: isSmallLocaladmin, resolve: resolveSmallLocaladmin },
    { either: isNonPopularNeighbourhood, resolve: resolveNonPopularNeighbourhood },
    {
      either: _.constant(true),
      resolve: (result1, result2) => {
        const score1 = adjustedScore(clean, result1);
        const score2 = adjustedScore(clean, result2);

        if (isNaN(score1) || isNaN(score2)) {
          return -1;
        }

        if (score1 === score2) {
          return -1;
        }

        return score1 > score2 ? -1 : 1;
      }
    }
  ];

  return (result1, result2) => {
    const layer = fallbacks.find((layer) => {
      return [result1, result2].some(layer.either);
    });

    return layer.resolve(result1, result2, focus_point);
  };
};
