const tape = require('tape');
const _ = require('lodash');

const ResultBuilder = function(layer) {
  const result = {
    layer: layer,
    center_point: {}
  };

  return {
    population: function(population) {
      result.population = population;
      return this;
    },
    popularity: function(popularity) {
      result.popularity = popularity;
      return this;
    },
    lon: function(lon) {
      result.center_point.lon = lon;
      return this;
    },
    lat: function(lat) {
      result.center_point.lat = lat;
      return this;
    },
    build: function() {
      return result;
    }
  }

};

const mega_city = new ResultBuilder('locality').population(4000000).build();
const country = new ResultBuilder('country').build();
const dependency = new ResultBuilder('dependency').build();
const macroregion = new ResultBuilder('macroregion').build();
const region = new ResultBuilder('region').build();
const macrocounty = new ResultBuilder('macrocounty').build();
const county = new ResultBuilder('county').build();
const borough = new ResultBuilder('borough').build();
const large_city = new ResultBuilder('locality').population(800000).build();
const medium_city = new ResultBuilder('locality').population(250000).build();
const small_city = new ResultBuilder('locality').population(2000).build();
const popular_neighbourhood = new ResultBuilder('neighbourhood').popularity(2000).build();
const non_popular_neighbourhood = new ResultBuilder('neighbourhood').popularity(500).build();

tape('interface test', (test) => {
  test.test('interface', (t) => {
    const sorter = require('../index');

    t.equal(typeof sorter, 'function', 'valid function');
    t.equal(sorter.length, 1, 'should take 1 parameter');
    t.equal(typeof sorter(), 'function', 'valid function');
    t.equal(sorter().length, 2, 'should take 2 parameters');
    t.end();
  });

});

tape('equality tests', (test) => {
  test.test('all results should be equal to themselves', (t) => {
    const sorter = require('../index')();

    [mega_city, country, dependency, macroregion, region, macrocounty, county, medium_city, /*small_city*/].forEach((result) => {
      t.equals(sorter(result, result), 0);
    })

    t.end();

  });

});

tape('mega_city', (test) => {
  test.test('mega_city should rank higher than all other placetypes', (t) => {
    const sorter = require('../index')();

    [country, dependency, macroregion, region, macrocounty, county, medium_city, small_city].forEach((non_mega_city) => {
      t.ok(sorter(mega_city, non_mega_city) < 0);
      t.ok(sorter(non_mega_city, mega_city) > 0);
    })

    t.end();

  });

  test.test('comparing megacities should favor larger higher population', (t) => {
    const result1 = new ResultBuilder('locality').population(4000001).build();
    const result2 = new ResultBuilder('locality').population(4000000).build();

    const sorter = require('../index')();

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

});

tape('countries', (test) => {
  test.test('country should outrank everything else except mega_city', (t) => {
    const sorter = require('../index')();

    [dependency, macroregion, region, macrocounty, county, medium_city, small_city].forEach((non_country) => {
      t.ok(sorter(country, non_country) < 0);
      t.ok(sorter(non_country, country) > 0);
    });
    t.end();

  });

  test.test('countries compared should rank by population descending', (t) => {
    const higher_population_country = new ResultBuilder('country').population(2).build();
    const lower_population_country = new ResultBuilder('country').population(1).build();

    const sorter = require('../index')();

    t.ok(sorter(higher_population_country, lower_population_country) < 0);
    t.ok(sorter(lower_population_country, higher_population_country) > 0);
    t.end();

  });

  test.test('countries w/o population should treat as equal to 0', (t) => {
    const with_population_country = new ResultBuilder('country').population(1).build();
    const no_population_country = new ResultBuilder('country').build();

    const sorter = require('../index')();

    t.ok(sorter(with_population_country, no_population_country) < 0);
    t.ok(sorter(no_population_country, with_population_country) > 0);
    t.end();

  });

});

tape('dependencies', (test) => {
  test.test('dependency should outrank everything else except mega_city', (t) => {
    const sorter = require('../index')();

    [macroregion, region, macrocounty, county, medium_city, small_city].forEach((non_dependency) => {
      t.ok(sorter(dependency, non_dependency) < 0);
      t.ok(sorter(non_dependency, dependency) > 0);
    });
    t.end();

  });

  test.test('dependencies compared should rank by population descending', (t) => {
    const result1 = new ResultBuilder('dependency').population(2).build();
    const result2 = new ResultBuilder('dependency').population(1).build();

    const sorter = require('../index')();

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('dependencies w/o population should treat as equal to 0', (t) => {
    const with_population_dependency = new ResultBuilder('dependency').population(1).build();
    const no_population_dependency = new ResultBuilder('dependency').build();

    const sorter = require('../index')();

    t.ok(sorter(with_population_dependency, no_population_dependency) < 0);
    t.ok(sorter(no_population_dependency, with_population_dependency) > 0);
    t.end();

  });

});

tape('macroregions', (test) => {
  test.test('macroregion should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [region, macrocounty, county, medium_city, small_city].forEach((non_macroregion) => {
      t.ok(sorter(macroregion, non_macroregion) < 0);
      t.ok(sorter(non_macroregion, macroregion) > 0);
    });
    t.end();

  });

  test.test('macroregions compared should rank by population descending', (t) => {
    const higher_population_macroregion = new ResultBuilder('macroregion').population(2).build();
    const lower_population_macroregion = new ResultBuilder('macroregion').population(1).build();

    const sorter = require('../index')();

    t.ok(sorter(higher_population_macroregion, lower_population_macroregion) < 0);
    t.ok(sorter(lower_population_macroregion, higher_population_macroregion) > 0);
    t.end();

  });

  test.test('macroregions w/o population should treat as equal to 0', (t) => {
    const with_population_macroregion = new ResultBuilder('macroregion').population(1).build();
    const no_population_macroregion = new ResultBuilder('macroregion').build();

    const sorter = require('../index')();

    t.ok(sorter(with_population_macroregion, no_population_macroregion) < 0);
    t.ok(sorter(no_population_macroregion, with_population_macroregion) > 0);
    t.end();

  });

});

tape('regions', (test) => {
  test.test('region should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [macrocounty, county, medium_city, small_city].forEach((non_region) => {
      t.ok(sorter(region, non_region) < 0);
      t.ok(sorter(non_region, region) > 0);
    });
    t.end();

  });

  test.test('regions compared should rank by population descending', (t) => {
    const higher_population_region = new ResultBuilder('region').population(2).build();
    const lower_population_region = new ResultBuilder('region').population(1).build();

    const sorter = require('../index')();

    t.ok(sorter(higher_population_region, lower_population_region) < 0);
    t.ok(sorter(lower_population_region, higher_population_region) > 0);
    t.end();

  });

  test.test('regions w/o population should treat as equal to 0', (t) => {
    const with_population_region = new ResultBuilder('region').population(1).build();
    const no_population_region = new ResultBuilder('region').build();

    const sorter = require('../index')();

    t.ok(sorter(with_population_region, no_population_region) < 0);
    t.ok(sorter(no_population_region, with_population_region) > 0);
    t.end();

  });

});

tape('macrocounties', (test) => {
  test.test('macrocounty should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [county, medium_city, small_city].forEach((non_macrocounty) => {
      t.ok(sorter(macroregion, non_macrocounty) < 0);
      t.ok(sorter(non_macrocounty, macroregion) > 0);
    });
    t.end();

  });

  test.test('macrocounties compared should rank by population descending', (t) => {
    const higher_population_macrocounty = new ResultBuilder('macrocounty').population(2).build();
    const lower_population_macrocounty = new ResultBuilder('macrocounty').population(1).build();

    const sorter = require('../index')();

    t.ok(sorter(higher_population_macrocounty, lower_population_macrocounty) < 0);
    t.ok(sorter(lower_population_macrocounty, higher_population_macrocounty) > 0);
    t.end();

  });

  test.test('macrocounties w/o population should treat as equal to 0', (t) => {
    const with_population_macrocounty = new ResultBuilder('macrocounty').population(1).build();
    const no_population_macrocounty = new ResultBuilder('macrocounty').build();

    const sorter = require('../index')();

    t.ok(sorter(with_population_macrocounty, no_population_macrocounty) < 0);
    t.ok(sorter(no_population_macrocounty, with_population_macrocounty) > 0);
    t.end();

  });

});

tape('boroughs', (test) => {
  test.test('boroughs should rank higher than these things', (t) => {
    const sorter = require('../index')();

    [county, medium_city, small_city].forEach((non_borough) => {
      t.ok(sorter(borough, non_borough) < 0);
      t.ok(sorter(non_borough, borough) > 0);
    });
    t.end();

  });

  test.test('boroughs compared should rank by population descending', (t) => {
    const higher_population_borough = new ResultBuilder('borough').population(2).build();
    const lower_population_borough = new ResultBuilder('borough').population(1).build();

    const sorter = require('../index')();

    t.ok(sorter(higher_population_borough, lower_population_borough) < 0);
    t.ok(sorter(lower_population_borough, higher_population_borough) > 0);
    t.end();

  });

  test.test('boroughs w/o population should treat as equal to 0', (t) => {
    const with_population_borough = new ResultBuilder('borough').population(1).build();
    const no_population_borough = new ResultBuilder('borough').build();

    const sorter = require('../index')();

    t.ok(sorter(with_population_borough, no_population_borough) < 0);
    t.ok(sorter(no_population_borough, with_population_borough) > 0);
    t.end();

  });

});

tape('counties', (test) => {
  test.test('county should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [small_city].forEach((non_county) => {
      t.ok(sorter(county, non_county) < 0);
      t.ok(sorter(non_county, county) > 0);
    });
    t.end();

  });

  test.test('counties compared should rank by population descending', (t) => {
    const higher_population_county = new ResultBuilder('county').population(2).build();
    const lower_population_county = new ResultBuilder('county').population(1).build();

    const sorter = require('../index')();

    t.ok(sorter(higher_population_county, lower_population_county) < 0);
    t.ok(sorter(lower_population_county, higher_population_county) > 0);
    t.end();

  });

  test.test('counties w/o population should treat as equal to 0', (t) => {
    const with_population_county = new ResultBuilder('county').population(1).build();
    const no_population_county = new ResultBuilder('county').build();

    const sorter = require('../index')();

    t.ok(sorter(with_population_county, no_population_county) < 0);
    t.ok(sorter(no_population_county, with_population_county) > 0);
    t.end();

  });

});

tape('large size cities', (test) => {
  test.test('large size city should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [macroregion, region, macrocounty, county, medium_city, small_city].forEach((non_large_city) => {
      t.ok(sorter(large_city, non_large_city) < 0);
      t.ok(sorter(non_large_city, large_city) > 0);
    });
    t.end();

  });

  test.test('large size cities compared should rank by population descending', (t) => {
    const result1 = new ResultBuilder('locality').population(700000).build();
    const result2 = new ResultBuilder('locality').population(600000).build();

    const sorter = require('../index')();

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

});

tape('medium size cities', (test) => {
  test.test('medium size city should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [county, small_city].forEach((non_medium_city) => {
      t.ok(sorter(medium_city, non_medium_city) < 0);
      t.ok(sorter(non_medium_city, medium_city) > 0);
    });
    t.end();

  });

  test.test('-focus.point: should sort medium size cities by population', (t) => {
    // Lancaster, PA vs Lancaster, CA
    const result1 = new ResultBuilder('locality').population(200000).build();
    const result2 = new ResultBuilder('locality').population(100000).build();

    const sorter = require('../index')();

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: should rank by distance to point', (t) => {
    const result1 = new ResultBuilder('locality').population(100000).lon(1).lat(1).build();
    const result2 = new ResultBuilder('locality').population(200000).lon(2).lat(2).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: results w/center_point should rank higher than w/o', (t) => {
    const result1 = new ResultBuilder('locality').population(100000).lon(1).lat(1).build();
    const result2 = new ResultBuilder('locality').population(200000).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

});

tape('popular neighbourhoods', (test) => {
  test.test('popular neighbourhoods should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [small_city, non_popular_neighbourhood].forEach((non_popular_neighbourhood) => {
      t.ok(sorter(popular_neighbourhood, non_popular_neighbourhood) < 0);
      t.ok(sorter(non_popular_neighbourhood, popular_neighbourhood) > 0);
    });
    t.end();

  });

  test.test('-focus.point: should sort popular neighbourhoods by popularity', (t) => {
    // Lancaster, PA vs Lancaster, CA
    const result1 = new ResultBuilder('neighbourhood').popularity(3000).build();
    const result2 = new ResultBuilder('neighbourhood').popularity(2000).build();

    const sorter = require('../index')();

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: should rank by distance to point', (t) => {
    const result1 = new ResultBuilder('neighbourhood').popularity(2000).lon(1).lat(1).build();
    const result2 = new ResultBuilder('neighbourhood').popularity(3000).lon(2).lat(2).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: results w/center_point should rank higher than w/o', (t) => {
    const result1 = new ResultBuilder('neighbourhood').popularity(2000).lon(1).lat(1).build();
    const result2 = new ResultBuilder('neighbourhood').popularity(3000).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

});

tape('small size cities', (test) => {
  test.test('small size city should outrank everything below it', (t) => {
    const sorter = require('../index')();

    [non_popular_neighbourhood].forEach((non_small_city) => {
      t.ok(sorter(small_city, non_small_city) < 0);
      t.ok(sorter(non_small_city, small_city) > 0);
    });
    t.end();

  });

  test.test('-focus.point: should sort medium size cities by population', (t) => {
    // Lancaster, PA vs Lancaster, CA
    const result1 = new ResultBuilder('locality').population(2000).build();
    const result2 = new ResultBuilder('locality').population(1000).build();

    const sorter = require('../index')();

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: should rank by distance to point', (t) => {
    const result1 = new ResultBuilder('locality').population(1000).lon(1).lat(1).build();
    const result2 = new ResultBuilder('locality').population(2000).lon(2).lat(2).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: results w/center_point should rank higher than w/o', (t) => {
    const result1 = new ResultBuilder('locality').population(1000).lon(1).lat(1).build();
    const result2 = new ResultBuilder('locality').population(2000).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

});

tape('non-popular neighbourhoods', (test) => {
  test.test('-focus.point: should sort non-popular neighbourhoods by popularity', (t) => {
    const result1 = new ResultBuilder('neighbourhood').popularity(2).build();
    const result2 = new ResultBuilder('neighbourhood').popularity(1).build();

    const sorter = require('../index')();

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: should rank by distance to point', (t) => {
    const result1 = new ResultBuilder('neighbourhood').popularity(1).lon(1).lat(1).build();
    const result2 = new ResultBuilder('neighbourhood').popularity(2).lon(2).lat(2).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

  test.test('+focus.point: results w/center_point should rank higher than w/o', (t) => {
    const result1 = new ResultBuilder('neighbourhood').popularity(1).lon(1).lat(1).build();
    const result2 = new ResultBuilder('neighbourhood').popularity(2).build();

    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    t.ok(sorter(result1, result2) < 0);
    t.ok(sorter(result2, result1) > 0);
    t.end();

  });

});

// tape.only('smoke tests', (test) => {
//   test.test('generic test', (t) => {
//     const sorter = require('../index')();
//
//     const original = [county, region];
//     original.sort(sorter);
//
//     // t.ok(sorter(region, county) > 0);
//     // t.ok(sorter(county, region) < 0);
//
//     t.deepEquals(original, [region, county]);
//     t.end();
//
//     // [county, small_city].forEach((non_medium_city) => {
//     //   t.ok(sorter(medium_city, non_medium_city) > 0);
//     //   t.ok(sorter(non_medium_city, medium_city) < 0);
//     // });
//     // t.end();
//
//   });
//
// });
