> This repository is part of the [Pelias](https://github.com/pelias/pelias) project. Pelias is an open-source, open-data geocoder built by [Mapzen](https://www.mapzen.com/) that also powers [Mapzen Search](https://mapzen.com/projects/search). Our official user documentation is [here](https://mapzen.com/documentation/search/).

# Pelias Result Sorting

![Travis CI Status](https://travis-ci.org/pelias/sorting.svg)
[![Gitter Chat](https://badges.gitter.im/pelias/pelias.svg)](https://gitter.im/pelias/pelias?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Overview

Module that sorts for ambiguous Pelias search and geocoding results

## Installation

```bash
$ npm install pelias-sorting
```

[![NPM](https://nodei.co/npm/pelias-sorting.png?downloads=true&stars=true)](https://nodei.co/npm/pelias-sorting)

## NPM Module

The `pelias-sorting` npm module can be found here:

[https://npmjs.org/package/pelias-sorting](https://npmjs.org/package/pelias-sorting)

## Resolving ambiguities

The list presented here is used to resolve ambiguities in Pelias.  For example, there's only one place named [Truth or Consequences](https://whosonfirst.mapzen.com/spelunker/id/85976585) so there are no ambiguities to sort, but "Lancaster" can be interpreted as any of:

- 2 neighbourhoods
- 13 cities (in 2 countries)
- 4 counties

Without additional information such as state to narrow down this list, Pelias sorts these ambiguities according to what the user is more likely referring to.  According to the ordering rules below, the input "Lancaster" without `focus.point` parameters would return [Lancaster, California](https://whosonfirst.mapzen.com/spelunker/id/85923547) since it's the most populous of the mid-sized cities.  However, if `focus.point.lat=54.232&focus.point.lon=-6.721` (roughly the center of Great Britain) was supplied for the same query, then [Lancaster, England](https://whosonfirst.mapzen.com/spelunker/id/101873271) would be returned first.  

### Ordering Rules

1.  very large city
  - population > 4,000,000
  - `Paris` should always rank [Paris, France](https://whosonfirst.mapzen.com/spelunker/id/101751119) higher than [Paris, Texas](https://whosonfirst.mapzen.com/spelunker/id/101725293) since people looking for the latter will supply additional qualifiers such as state or country.
  - Examples:
    - [New York City](https://whosonfirst.mapzen.com/spelunker/id/85977539)
    - [Bangkok](https://whosonfirst.mapzen.com/spelunker/id/102025263)
2.  continent
  - Continent names are so well known that users looking for some more granular are accustomed to adding additional qualifiers.
  - Examples:
    - [Asia](https://whosonfirst.mapzen.com/spelunker/id/102191569)
    - [Antarctica](https://whosonfirst.mapzen.com/spelunker/id/102191579)
3.  country
  - These names are so well known that users looking for some more granular are accustomed to adding additional qualifiers.  For example, Luxembourg the country contains a city named [Luxembourg](https://whosonfirst.mapzen.com/spelunker/id/101751765) but users entering `Luxembourg` without additional qualification are normally looking for the country.
  - Examples:
    - [Canada](https://whosonfirst.mapzen.com/spelunker/id/85633041)
    - [Laos](https://whosonfirst.mapzen.com/spelunker/id/85632241)
4.  [dependency](https://github.com/whosonfirst/whosonfirst-placetypes#dependency)
  - These names are so well known that users looking for some more granular are accustomed to adding additional qualifiers
  - Examples:
    - [Puerto Rico](https://whosonfirst.mapzen.com/spelunker/id/85633729)
    - [Gibraltar](https://whosonfirst.mapzen.com/spelunker/id/85633167)
5.  large city
  - population between 500,000 and 4,000,000
  - Ties among mid-size cities are broken by preferring those closer to `focus.point` or greater population if not supplied.
  - Examples:
    - [San Francisco, California](https://whosonfirst.mapzen.com/spelunker/id/85922583)
    - [Marseilles, France](https://whosonfirst.mapzen.com/spelunker/id/101749199)
6.  [macroregion](https://github.com/whosonfirst/whosonfirst-placetypes#macroregion)
  - Macroregions are considered groups of regions.  While this classification is limited to Europe, an unofficial colloquial United States analog would be New England, which contains [Connecticut](), [Maine](https://whosonfirst.mapzen.com/spelunker/id/85688769/), [Massachusetts](https://whosonfirst.mapzen.com/spelunker/id/85688645/), [New Hampshire](https://whosonfirst.mapzen.com/spelunker/id/85688689/), [Rhode Island](https://whosonfirst.mapzen.com/spelunker/id/85688509/), and [Vermont](https://whosonfirst.mapzen.com/spelunker/id/85688763/).  
  - Examples:
    - [Sardinia, Italy](https://whosonfirst.mapzen.com/spelunker/id/404227535)
    - [Andalusia, Spain](https://whosonfirst.mapzen.com/spelunker/id/404227361)
7.  region
  - These are "states" in the United States and "provinces" in Canada.  
  - Examples:
    - [New Mexico, USA](https://whosonfirst.mapzen.com/spelunker/id/85688493)
    - [British Columbia, Canada](https://whosonfirst.mapzen.com/spelunker/id/85682117)
9.  [borough](https://github.com/whosonfirst/whosonfirst-placetypes#borough)
  - Examples:
    - [Manhattan, New York City](https://whosonfirst.mapzen.com/spelunker/id/421205771)
    - [Bronx](https://whosonfirst.mapzen.com/spelunker/id/421205775)
9.  mid-size city
  - population between 5,000 and 500,000
  - Ties among mid-size cities are broken by preferring those closer to `focus.point` or greater population if not supplied.
  - Examples:
    - [Socorro, New Mexico](https://whosonfirst.mapzen.com/spelunker/id/85976677)
    - [Strasbourg, France](https://whosonfirst.mapzen.com/spelunker/id/101751113)
10.  [macrocounty](https://github.com/whosonfirst/whosonfirst-placetypes#macrocounty)
  - macrocounty results are ranked below medium cities because they typically contain a city of the same name that users are normally interested in
  - Examples:
    - [Perpignan, France](https://whosonfirst.mapzen.com/spelunker/id/404227943)
    - [Stuttgart, Germany](https://whosonfirst.mapzen.com/spelunker/id/404227549)
11.  county
  - Like macrocounty, counties normally contain a city with the same name
  - Examples:
    - [Maui, Hawaii](https://whosonfirst.mapzen.com/spelunker/id/102085577)
    - [Nordsachsen, Sachsen, Germany](https://whosonfirst.mapzen.com/spelunker/id/102064235)
12.  popular neighbourhood - popularity >= 1000
  - Ties among popular neighbourhoods are broken by preferring those closer to `focus.point` or greater popularity if not supplied.
  - Examples:
    - [Chelsea, New York City](https://whosonfirst.mapzen.com/spelunker/id/85810575)
    - [Hyde Park](https://whosonfirst.mapzen.com/spelunker/id/85861707)
13.  small city - population < 5,000
  - Ties among small cities are broken by preferring those closer to `focus.point` or greater population if not supplied.
  - Examples:
    - [Yoe, Pennsylvania](https://whosonfirst.mapzen.com/spelunker/id/101717281)
    - [Großerlach, Germany](https://whosonfirst.mapzen.com/spelunker/id/101760693)
14.  non-popular neighbourhood - popularity < 1,000
  - Ties among non-popular neighbourhoods are broken by preferring those closer to `focus.point` or greater popularity if not supplied.
  - Examples:
    - [The Flats, Wilmington, DE](https://whosonfirst.mapzen.com/spelunker/id/85888525)
    - [Dagenham Heathway, London, GB](https://whosonfirst.mapzen.com/spelunker/id/85860857)

**Regarding neighbourhoods, Pelias makes no qualitative stance on what the term "popularity" means.**
