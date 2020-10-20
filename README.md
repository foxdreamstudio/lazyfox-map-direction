# lazyfox-map-direction a react and react-native component

[![version](https://img.shields.io/npm/v/lazyfox-map-direction.svg)](https://www.npmjs.com/package/lazyfox-map-direction)
[![downloads](https://img.shields.io/npm/dy/lazyfox-map-direction.svg)](https://www.npmjs.com/package/lazyfox-map-direction)

React and React-native component to render distance from google map api


## Prerequisites

This library is pure react component, so just have fun on it

## Installation

To install this component to your **react-native or react project**, please just following this instruction bellow.
```bash
#on your root project, enter command
$ npm install --save lazyfox-map-direction

```

## Example code

To use this component to your **react-native project**, please just following this instruction bellow.
```jsx
import React, {Component} from 'react';
import {Text, View} from 'react-native';
import LazyfoxMapDirection from "lazyfox-map-direction";
import MapView, { Polyline } from 'react-native-maps';

export default class App extends Component<Props> {
  render() {
    const location = [
      {latitude: -33.873273, longitude: 151.204973},
      {latitude: -33.873273, longitude: 151.304973},
      {latitude: -33.873273, longitude: 151.404973},
      {latitude: -33.873273, longitude: 151.504973}
    ]
    return (
      <MapView >
        { location?.length > 0 &&
          <LazyfoxMapDirection 
            apiKey={GOOGLE_KEY} // google maps api 
            wayPoint = {location}  // array
            wayPointLimit = {10} // optional
            renderLine={(coordinates)=>(
              <Polyline coordinates = {coordinates} />
            )} 
          />
        }
      </MapView>
    );
  }
}

```


## defaultProps

So you can add many properties, you can look at the list of defaultprops / properties

```jsx
// Propeties 

LazyfoxMapDirection.defaultProps = {
  mode: 'driving',
  apiKey: '',
  wayPoint: [],
  wayPointLimit: 2,
  onError: () => null,
  onFinish:() => null,
  renderLine: () => null,
  onStart:() => null
};

```

## Dependencies

no depedencies, its all use react component and google distance api component

## contact
if there is issues, please tell me  by crating issues or just emailing me.
email : ridwan_foxdream@outlook.com
subject: ASK_LAZYFOX-MAP-DIRECTION

## License

**MIT** Licences
