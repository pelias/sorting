<p align="center">
  <img height="100" src="https://raw.githubusercontent.com/pelias/design/master/logo/pelias_github/Github_markdown_hero.png">
</p>
<h3 align="center">A modular, open-source search engine for our world.</h3>
<p align="center">Pelias is a geocoder powered completely by open data, available freely to everyone.</p>
<p align="center">
<a href="https://github.com/pelias/sorting/actions"><img src="https://github.com/pelias/sorting/workflows/Continuous%20Integration/badge.svg" /></a>
<a href="https://en.wikipedia.org/wiki/MIT_License"><img src="https://img.shields.io/github/license/pelias/sorting?style=flat&color=orange" /></a>
<a href="https://gitter.im/pelias/pelias"><img src="https://img.shields.io/gitter/room/pelias/pelias?style=flat&color=yellow" /></a>
</p>
<p align="center">
	<a href="https://github.com/pelias/docker">Local Installation</a> ·
        <a href="https://geocode.earth">Cloud Webservice</a> ·
	<a href="https://github.com/pelias/documentation">Documentation</a> ·
	<a href="https://gitter.im/pelias/pelias">Community Chat</a>
</p>
<details open>
<summary>What is Pelias?</summary>
<br />
Pelias is a search engine for places worldwide, powered by open data. It turns addresses and place names into geographic coordinates, and turns geographic coordinates into places and addresses. With Pelias, you're able to turn your users' place searches into actionable geodata and transform your geodata into real places.
<br /><br />
We think open data, open source, and open strategy win over proprietary solutions at any part of the stack and we want to ensure the services we offer are in line with that vision. We believe that an open geocoder improves over the long-term only if the community can incorporate truly representative local knowledge.
</details>

# Pelias Result Sorting

[![Greenkeeper badge](https://badges.greenkeeper.io/pelias/sorting.svg)](https://greenkeeper.io/)

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

The list presented here is used to resolve ambiguities in Pelias.  For example, there's only one place named [Truth or Consequences](https://whosonfirst.mapzen.com/spelunker/id/85976585) so there are no ambiguities to sort.  Similarly, [Saint Petersburg, Russia](https://whosonfirst.mapzen.com/spelunker/id/102008123) is fully-qualified and unambiguous.  However, "Lancaster" can be interpreted as any of:

- 2 neighbourhoods
- 13 cities (in 2 countries)
- 4 counties

Without additional information such as state to narrow down this list, Pelias sorts these ambiguities according to what the user is more likely referring to.  According to the ordering rules below, the input "Lancaster" without `focus.point` parameters would return [Lancaster, California](https://whosonfirst.mapzen.com/spelunker/id/85923547) since it's the most populous of the mid-sized cities.  However, if `focus.point.lat=54.232&focus.point.lon=-6.721` (roughly the center of Great Britain) was supplied for the same query, then [Lancaster, England](https://whosonfirst.mapzen.com/spelunker/id/101873271) would be returned first.  

## Ordering Rules

Unless otherwise specified, ties between two results at the same layer are broken using population values with higher population results returned first.  

1.  very large city
  - population > 4,000,000
  - "Paris" should always rank [Paris, France](https://whosonfirst.mapzen.com/spelunker/id/101751119) higher than [Paris, Texas](https://whosonfirst.mapzen.com/spelunker/id/101725293) since people looking for the latter will supply additional qualifiers such as state or country.
  - Examples:
    1. [New York City, NY](https://whosonfirst.mapzen.com/spelunker/id/85977539)
    2. [Saint Petersburg, Russia](https://whosonfirst.mapzen.com/spelunker/id/102008123)
2.  continent
  - Continent names are so well known that users looking for some more granular are accustomed to adding additional qualifiers.
  - Examples:
    1. [Asia](https://whosonfirst.mapzen.com/spelunker/id/102191569)
    2. [Antarctica](https://whosonfirst.mapzen.com/spelunker/id/102191579)
3.  country
  - These names are so well known that users looking for some more granular are accustomed to adding additional qualifiers.  For example, Luxembourg the country contains a city named [Luxembourg](https://whosonfirst.mapzen.com/spelunker/id/101751765) but users entering `Luxembourg` without additional qualification are normally looking for the country.
  - Examples:
    1. [Canada](https://whosonfirst.mapzen.com/spelunker/id/85633041)
    2. [Laos](https://whosonfirst.mapzen.com/spelunker/id/85632241)
4.  [dependency](https://github.com/whosonfirst/whosonfirst-placetypes#dependency)
  - These names are so well known that users looking for some more granular are accustomed to adding additional qualifiers
  - Examples:
    1. [Puerto Rico](https://whosonfirst.mapzen.com/spelunker/id/85633729)
    2. [Gibraltar](https://whosonfirst.mapzen.com/spelunker/id/85633167)
5.  large city
  - population between 500,000 and 4,000,000
  - Ties among mid-size cities are broken by preferring those closer to `focus.point` or greater population if not supplied.
  - Examples:
    1. [San Francisco, California](https://whosonfirst.mapzen.com/spelunker/id/85922583)
    2. [Marseilles, France](https://whosonfirst.mapzen.com/spelunker/id/101749199)
6.  [macroregion](https://github.com/whosonfirst/whosonfirst-placetypes#macroregion)
  - Macroregions are considered groups of regions.  While this classification is limited to Europe, an unofficial colloquial United States analog would be New England, which contains [Connecticut](), [Maine](https://whosonfirst.mapzen.com/spelunker/id/85688769/), [Massachusetts](https://whosonfirst.mapzen.com/spelunker/id/85688645/), [New Hampshire](https://whosonfirst.mapzen.com/spelunker/id/85688689/), [Rhode Island](https://whosonfirst.mapzen.com/spelunker/id/85688509/), and [Vermont](https://whosonfirst.mapzen.com/spelunker/id/85688763/).  
  - Examples:
    1. [Sardinia, Italy](https://whosonfirst.mapzen.com/spelunker/id/404227535)
    2. [Andalusia, Spain](https://whosonfirst.mapzen.com/spelunker/id/404227361)
7.  region
  - These are "states" in the United States and "provinces" in Canada.  
  - Examples:
    1. [New Mexico, USA](https://whosonfirst.mapzen.com/spelunker/id/85688493)
    2. [British Columbia, Canada](https://whosonfirst.mapzen.com/spelunker/id/85682117)
8.  [borough](https://github.com/whosonfirst/whosonfirst-placetypes#borough)
  - Examples:
    1. [Manhattan, New York City](https://whosonfirst.mapzen.com/spelunker/id/421205771)
    2. [Bronx](https://whosonfirst.mapzen.com/spelunker/id/421205775)
9.  very popular neighbourhood - popularity >= 10,000
  - Ties among popular neighbourhoods are broken by preferring those closer to `focus.point` or greater popularity if not supplied.
  - Examples:
    1. [Chelsea, New York City](https://whosonfirst.mapzen.com/spelunker/id/85810575)
    2. [Greenwich, London](https://whosonfirst.mapzen.com/spelunker/id/85866377)
10.  mid-size city
  - population between 5,000 and 500,000
  - Ties among mid-size cities are broken by preferring those closer to `focus.point` or greater population if not supplied.
  - Examples:
    1. [Socorro, New Mexico](https://whosonfirst.mapzen.com/spelunker/id/85976677)
    2. [Strasbourg, France](https://whosonfirst.mapzen.com/spelunker/id/101751113)
11.  [macrocounty](https://github.com/whosonfirst/whosonfirst-placetypes#macrocounty)
  - macrocounty results are ranked below medium cities because they typically contain a city of the same name that users are normally interested in
  - Examples:
    1. [Perpignan, France](https://whosonfirst.mapzen.com/spelunker/id/404227943)
    2. [Stuttgart, Germany](https://whosonfirst.mapzen.com/spelunker/id/404227549)
12.  county
  - Like macrocounty, counties normally contain a city with the same name
  - Examples:
    1. [Maui, Hawaii](https://whosonfirst.mapzen.com/spelunker/id/102085577)
    2. [Nordsachsen, Sachsen, Germany](https://whosonfirst.mapzen.com/spelunker/id/102064235)
13.  [macrohood](https://github.com/whosonfirst/whosonfirst-placetypes#macrohood)
  - Groups of neighbourhoods
  - Examples:
    1. [San Fernando Valley, Los Angeles, CA](https://whosonfirst.mapzen.com/spelunker/id/1108692439/)
    2. [Suutarila, Helsinki, Finland](https://whosonfirst.mapzen.com/spelunker/id/890537277)
14.  popular neighbourhood - popularity between 1,000 and 10,000
  - Ties among popular neighbourhoods are broken by preferring those closer to `focus.point` or greater popularity if not supplied.
  - Examples:
    1. [Rittenhouse Square, Philadelphia](https://whosonfirst.mapzen.com/spelunker/id/85844705/)
    2. [Hyde Park](https://whosonfirst.mapzen.com/spelunker/id/85861707)
15.  small city - population < 5,000
  - Ties among small cities are broken by preferring those closer to `focus.point` or greater population if not supplied.
  - Examples:
    1. [Yoe, Pennsylvania](https://whosonfirst.mapzen.com/spelunker/id/101717281)
    2. [Großerlach, Germany](https://whosonfirst.mapzen.com/spelunker/id/101760693)
16.  non-popular neighbourhood - popularity < 1,000
  - Ties among non-popular neighbourhoods are broken by preferring those closer to `focus.point` or greater popularity if not supplied.
  - Examples:
    1. [The Flats, Wilmington, DE](https://whosonfirst.mapzen.com/spelunker/id/85888525)
    2. [Dagenham Heathway, London, GB](https://whosonfirst.mapzen.com/spelunker/id/85860857)

***Regarding neighbourhoods, Pelias has no qualitative stance on what the term "popularity" means.***
