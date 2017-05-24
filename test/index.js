const tape = require('tape');
const _ = require('lodash');

// helper to quickly build results for sorting tests
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
  };

};

// canned results for later reference
const mega_locality = new ResultBuilder('locality').population(4000000).build();
const mega_localadmin = new ResultBuilder('localadmin').population(4000000).build();
const continent = new ResultBuilder('continent').build();
const country = new ResultBuilder('country').build();
const dependency = new ResultBuilder('dependency').build();
const macroregion = new ResultBuilder('macroregion').build();
const region = new ResultBuilder('region').build();
const macrocounty = new ResultBuilder('macrocounty').build();
const county = new ResultBuilder('county').build();
const borough = new ResultBuilder('borough').build();
const large_locality = new ResultBuilder('locality').population(800000).build();
const large_localadmin = new ResultBuilder('localadmin').population(800000).build();
const medium_locality = new ResultBuilder('locality').population(250000).build();
const medium_localadmin = new ResultBuilder('localadmin').population(250000).build();
const small_locality = new ResultBuilder('locality').population(2000).build();
const small_localadmin = new ResultBuilder('localadmin').population(2000).build();
const popular_neighbourhood = new ResultBuilder('neighbourhood').popularity(2000).build();
const non_popular_neighbourhood = new ResultBuilder('neighbourhood').popularity(500).build();

const results_in_order = [
  mega_locality,
  mega_localadmin,
  country,
  dependency,
  large_locality,
  large_localadmin,
  macroregion,
  region,
  borough,
  medium_locality,
  medium_localadmin,
  macrocounty,
  county,
  popular_neighbourhood,
  small_locality,
  small_localadmin,
  non_popular_neighbourhood
];

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

    // iterate over all the canned results and assert that each is equal to itself
    results_in_order.forEach((result) => {
      t.equals(sorter(result, result), 0);
    });

    t.end();

  });

});

tape('basic ordering', (test) => {
  // this test ensures that a higher-ranked result is always weighed higher than
  // a lower-ranked result.  eg:
  // mega city > country, dependency, large city, medium city, etc
  // ...
  // county > popular neighbourhood, small locality, non-popular neighbourhood
  // ...
  test.test('each result should outrank all results below it', (t) => {
    const sorter = require('../index')();

    results_in_order.forEach((higher_result, i) => {
      results_in_order.slice(i+1).forEach((lower_result) => {
        t.ok(sorter(higher_result, lower_result) < 0);
        t.ok(sorter(lower_result, higher_result) > 0);
      });

    });

    t.end();
  });

});

tape('population tie-breaker layers', (test) => {
  test.test('layers compared should rank by population descending', (t) => {
    const sorter = require('../index')();

    // iterate over all layers that break ties by comparing population values
    [
      'continent',
      'country',
      'dependency',
      'macroregion',
      'region',
      'macrocounty',
      'county',
      'borough'
    ].forEach((layer) => {
      const higher_population_result = new ResultBuilder(layer).population(2).build();
      const lower_population_result = new ResultBuilder(layer).population(1).build();

      t.ok(sorter(higher_population_result, lower_population_result) < 0);
      t.ok(sorter(lower_population_result, higher_population_result) > 0);

    });

    t.end();

  });

  test.test('population to default to 0 when not explicitly set', (t) => {
    const sorter = require('../index')();

    // iterate over all layers that break ties by comparing population values
    // treating no population as 0
    [
      'continent',
      'country',
      'dependency',
      'macroregion',
      'region',
      'macrocounty',
      'county',
      'borough'
    ].forEach((layer) => {
      const higher_population_result = new ResultBuilder(layer).population(1).build();
      const no_population_result = new ResultBuilder(layer).build();

      t.ok(sorter(higher_population_result, no_population_result) < 0);
      t.ok(sorter(no_population_result, higher_population_result) > 0);

    });

    t.end();

  });

});

tape('locality/localadmin', (test) => {
  test.test('locality/localadmin at various sizes w/o focus.point should order by population descending', (t) => {
    const sorter = require('../index')();

    // iterate over the minimum population for each band and ensure that a population+1 result
    // for both locality and localadmin will rank higher than a result with a lower population
    [0, 5000, 500000, 4000000].forEach((population) => {
      ['locality', 'localadmin'].forEach((layer) => {
        const higher_population_result = new ResultBuilder(layer).population(population+1).build();
        const lower_population_result = new ResultBuilder(layer).population(population).build();

        t.ok(sorter(higher_population_result, lower_population_result) < 0);
        t.ok(sorter(lower_population_result, higher_population_result) > 0);

      });
    });

    t.end();

  });

  test.test('locality/localadmin at non-mega sizes w/focus.point should order by distance', (t) => {
    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    // iterate over minimum non-megacity population bands and ensure that closer distance
    // to focus.point ranks higher than higher population
    [0, 5000, 500000].forEach((population) => {
      ['locality', 'localadmin'].forEach((layer) => {
        const closer_distance_result = new ResultBuilder(layer).population(population).lat(1).lon(1).build();
        const further_distance_result = new ResultBuilder(layer).population(population+1).lat(2).lon(2).build();

        t.ok(sorter(closer_distance_result, further_distance_result) < 0);
        t.ok(sorter(further_distance_result, closer_distance_result) > 0);

      });

    });

    t.end();

  });

  test.test('locality/localadmin at non-mega sizes w/focus.point should order by distance', (t) => {
    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    // iterate over minimum non-megacity population bands and ensure that closer distance
    // to focus.point ranks higher than higher population
    [0, 5000, 500000].forEach((population) => {
      ['locality', 'localadmin'].forEach((layer) => {
        const closer_distance_result = new ResultBuilder(layer).population(population).lat(1).lon(1).build();
        const further_distance_result = new ResultBuilder(layer).lat(2).lon(2).build();

        t.ok(sorter(closer_distance_result, further_distance_result) < 0);
        t.ok(sorter(further_distance_result, closer_distance_result) > 0);

      });

    });

    t.end();

  });

});

tape('neighbourhood', (test) => {
  test.test('neighbourhoods at popularities w/o focus.point should order by popularity descending', (t) => {
    const sorter = require('../index')();

    // iterate over the minimum popularity for each band and ensure that a popularity+1 result
    // rank higher than a result with a lower popularity
    [0, 1000].forEach((popularity) => {
      const higher_popularity_result = new ResultBuilder('neighbourhood').popularity(popularity+1).build();
      const lower_popularity_result = new ResultBuilder('neighbourhood').popularity(popularity).build();

      t.ok(sorter(higher_popularity_result, lower_popularity_result) < 0);
      t.ok(sorter(lower_popularity_result, higher_popularity_result) > 0);

    });

    t.end();

  });

  test.test('neighbourhoods at popularities w/focus.point should order by distance', (t) => {
    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    // iterate over minimum popularity bands and ensure that closer distance
    // to focus.point ranks higher than higher popularity
    [0, 1000].forEach((popularity) => {
      const closer_distance_result = new ResultBuilder('neighbourhood').popularity(popularity).lat(1).lon(1).build();
      const further_distance_result = new ResultBuilder('neighbourhood').popularity(popularity+1).lat(2).lon(2).build();

      t.ok(sorter(closer_distance_result, further_distance_result) < 0);
      t.ok(sorter(further_distance_result, closer_distance_result) > 0);

    });

    t.end();

  });

  test.test('neighbourhoods at popularities w/focus.point should order by distance', (t) => {
    const clean = {
      'focus.point.lon': 0,
      'focus.point.lat': 0
    };

    const sorter = require('../index')(clean);

    // iterate over minimum popularity bands and ensure that closer distance
    // to focus.point ranks higher than higher popularity
    [0, 1000].forEach((popularity) => {
      const closer_distance_result = new ResultBuilder('neighbourhood').popularity(popularity).lat(1).lon(1).build();
      const further_distance_result = new ResultBuilder('neighbourhood').lat(2).lon(2).build();

      t.ok(sorter(closer_distance_result, further_distance_result) < 0);
      t.ok(sorter(further_distance_result, closer_distance_result) > 0);

    });

    t.end();

  });

});
