import React, { Component } from 'react';
import { lineDecoder, foxArray, getLocation } from './LazyFoxUtils';
class LazyfoxMapDirection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinates: [],
      index: 0,
      wayPoint: foxArray(getLocation(props.wayPoint)).chunk(props.wayPointLimit),
    };
    this.newPromise = null
  }

  componentDidMount() {
    this.init(this.props);
  }

  componentWillUnmount = () => {
    if(this.newPromise?.reject){
      this.newPromise.reject();
    }
  }

  componentDidUpdate = (prevProps) => {
    const { props } = this;
    if (prevProps.wayPoint !== props.wayPoint || prevProps.apiKey !== props.apiKey || prevProps.mode !== props.mode) {
      this.init(props);
    }
  };

  init = (props) => {
    if(this.newPromise?.reject){
      this.newPromise.reject();
    }
    this.setState({ 
      wayPoint: foxArray(getLocation(props.wayPoint)).chunk(props.wayPointLimit) ,
      index: 0
    });
    if (props.wayPoint.length >= 2) {
      this.newPromise = new Promise((resolve, reject) => {
        this.getRoute();
      })
    }
  };

  getRoute = () => {
    const { props, state } = this;
    const url = 'https://maps.googleapis.com/maps/api/directions/json?';
    const params = [
      `key=${props.apiKey}`,
      `mode=${props.mode}`,
    ];
    const newDestination = state.wayPoint[state.index];
    params.push( `destination=${newDestination[newDestination?.length - 1]}`);
    if(newDestination){
      params.push( `waypoints=${newDestination.join('|')}`);
    }
    if (state.index > 0) {
      const newOrigin = state.wayPoint[state.index - 1];
      params.push(`origin=${newOrigin[newOrigin.length - 1]}`);
    } else {
      const newOrigin = state.wayPoint[state.index];
      params.push(`origin=${newOrigin[0]}`);
    }

    const newUrl = `${url}${params.join('&')}`;
    fetch(newUrl)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.routes?.length > 0) {
          const newCoords = lineDecoder(responseJson.routes[0].overview_polyline?.points);
          const coordinates = [...state.coordinates, ...newCoords];
          this.setState({
            coordinates,
          });
        }
        this.setState({ index: this.state.index + 1 }, () => {
          if (this.state.index <= state.wayPoint.length - 1) {
            this.getRoute();
          }else{
            if(this.newPromise?.reject){
              this.newPromise.resolve();
            }
            props.onFinish({
              coordinates: this.state.coordinates,
              location: this.state.wayPoint,
            })
          }
        });
      })
      .catch((e) => {
        console.warn(e);
        this.setState({ index: state.index + 1 }, () => {
          if (this.state.index <= state.wayPoint.length - 1) {
            this.getRoute();
          }else{
            props.onError(e);
            if(this.newPromise?.reject){
              this.newPromise.reject();
            }
          }
        });
      });
  };

  render() {
    const { coordinates } = this.state;
    if (!coordinates) {
      return null;
    }
    return this.props.renderLine(coordinates);
  }
}

LazyfoxMapDirection.defaultProps = {
  mode: 'driving',
  apiKey: '',
  wayPoint: [],
  wayPointLimit: 2,
  onError: () => null,
  onFinish:() => null,
  renderLine: () => null
};
export { LazyfoxMapDirection };
