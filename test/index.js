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
  };

};

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
  macrocounty,
  borough,
  medium_locality,
  medium_localadmin,
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

    results_in_order.forEach((result) => {
      t.equals(sorter(result, result), 0);
    });

    t.end();

  });

});

tape('basic ordering', (test) => {
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

  test.test('layers compared should rank by population descending, defaulting to 0', (t) => {
    const sorter = require('../index')();

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

    [0, 1000].forEach((popularity) => {
      const closer_distance_result = new ResultBuilder('neighbourhood').popularity(popularity).lat(1).lon(1).build();
      const further_distance_result = new ResultBuilder('neighbourhood').lat(2).lon(2).build();

      t.ok(sorter(closer_distance_result, further_distance_result) < 0);
      t.ok(sorter(further_distance_result, closer_distance_result) > 0);

    });

    t.end();

  });

});
