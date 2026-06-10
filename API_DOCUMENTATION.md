## Overview

This document explains usage of GZMTEC API with examples. 
GZMTEC API (later refered to as GTAPI) is simply adjusting Metropolia GZM API (later refered to as MAPI) to the needs of the project and porting it to self endpoints.
Files that have connections to the API process have explaining comments in themselves, this document is for users seeking quick usage.

## Structure
- `sdip.service.js` - entry point for API, it collects necessary data from MAPI endpoints: stops, departures and vehicles. Timetable is not supported by GTAPI, data about it are being taken every month from GZM server and used only in OTP, there is no access to timetable through GTAPI
- models: `deviationOperations.models` `tripPlanner.models` `apiStatus.model`
- cotrollers: `deviationOperations.controller` `tripPlanner.controller` `apiStatus.controller`

## Endpoints
### `/api/deviations/estimate`
Description:
Provides data about estimated deviation of selected connection.
- input: 
    - lineLabel: `string` - line for which the search is requested f.e. `M3, 227, Z-38`
    - stopId: `int` - id of stop for which the search is requested taken from MAPI f.e. `5510, 4230, 216`
    - timestamp: `int` - UNIX timestamp for which the search is requested f.e. `1780506688`
    - tolerance: `int` - time frame in which the search can be made based on provided timestamp in seconds f.e. `300`
    - weekday: `string` - weekday for which the search is requested f.e. `Wednesday`
- output:
    - lineLabel: `string` - confirmation about the line for which search has been requested f.e. `M3, 227, Z-38`
    - stopId: `int` - confirmation about the stopId for which search have been requested f.e. `5510, 4230, 216`
    - timestamp: `int` - confirmation about the timestamp for which search have been requested f.e. `1780506688`
    - averageDeviation: `float` - counted estimate deviation of selected connection in minutes f.e. `7`
    - samples: `int` - number of samples that has been used to calculate the estimate deviation f.e. `12`
    - samplesData: `json` - full data of samples that has been used to calculate the estimate deviation f.e.
    ```json
    [
        {
            "id": 4242720,
            "deviation": 136,
            "timestamp": 1780506688
        }
    ]
    ```

### `/api/trip/search`
Provides list of connections consisting of legs along with estimated deviations for selected parameters
- input:
    - fromLat: `float` - latitude of start point of planned trip f.e. `50.33312`
    - fromLon: `float` - longitude of start point of planned trip f.e. `19.32312`
    - toLat: `float` - latitude of destination of planned trip f.e. `50.44454`
    - toLon: `float` - longitude of destination of planned trip f.e. `19.88574`
    - date: `string` - target date of search in format `yyyy-mm-dd` f.e. `2026-06-26`
    - time: `string` - target hour of search in format `hh:mm` f.e. `18:52`
- output example:
```json
{
    "legs": [
        {
            "mode": "WALK",
            "duration": 2,
            "startTime": 1782493198000,
            "endTime": 1782493200000,
            "route": null,
            "from": {
                "name": "Origin",
                "stop": null
            },
            "to": {
                "name": "Miechowice Pętla"
            }
        },
        {
            "mode": "BUS",
            "duration": 900,
            "startTime": 1782493200000,
            "endTime": 1782494100000,
            "route": {
                "shortName": "623"
            },
            "from": {
                "name": "Miechowice Pętla",
                "stop": {
                    "gtfsId": "9:1694"
                }
            },
            "to": {
                "name": "Bytom Dworzec"
            },
            "predictedDeviationSeconds": 0,
            "predictedSamplesCount": 0,
            "expectedStartTime": 1782493200000
        },
        {
            "mode": "WALK",
            "duration": 316,
            "startTime": 1782494100000,
            "endTime": 1782494416000,
            "route": null,
            "from": {
                "name": "Bytom Dworzec",
                "stop": {
                    "gtfsId": "9:3559"
                }
            },
            "to": {
                "name": "Bytom Zamłynie"
            }
        },
        {
            "mode": "TRAM",
            "duration": 360,
            "startTime": 1782494940000,
            "endTime": 1782495300000,
            "route": {
                "shortName": "T30"
            },
            "from": {
                "name": "Bytom Zamłynie",
                "stop": {
                    "gtfsId": "9:11602"
                }
            },
            "to": {
                "name": "Szombierki Kościół"
            },
            "predictedDeviationSeconds": 0,
            "predictedSamplesCount": 0,
            "expectedStartTime": 1782494940000
        },
        {
            "mode": "WALK",
            "duration": 293,
            "startTime": 1782495300000,
            "endTime": 1782495593000,
            "route": null,
            "from": {
                "name": "Szombierki Kościół",
                "stop": {
                    "gtfsId": "9:11578"
                }
            },
            "to": {
                "name": "Destination"
            }
        }
    ]
}
```
- mode - leg type: `WALK, TRAM, BUS`
- duration - amount of time estimated to spend on current leg refering to timetable
- startTime - timestamp of leg start
- endTime - timestamp of leg start
- route - contains details about bus/tram through which the leg is realised
- from - contains data about the beginning point of the trip such as name of stop and stopId (GTFS variant)
- to - contains data about the destination point of the trip such as name of stop and stopId (GTFS variant)