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
    this._promisessHandler.resolve();
  }

  componentDidUpdate = (prevProps) => {
    const { props } = this;
    if (prevProps.wayPoint !== props.wayPoint || prevProps.apiKey !== props.apiKey || prevProps.mode !== props.mode) {
      this.init(props);
    }
  };

  _promisessHandler = {resolve:()=>null, reject:()=>null};
  init = (props) => {
    this._promisessHandler.reject();
    const tempWayPoint =  foxArray(getLocation(props.wayPoint)).chunk(props.wayPointLimit) ;
    this.setState({ 
      wayPoint: tempWayPoint,
      index: 0,
      coordinates: [],
      fare: [],
      waypointOrder: [],
      location: tempWayPoint,
    });
    if (props.wayPoint.length >= 2) {
      new Promise((resolve, reject) => {
        this._promisessHandler = {resolve, reject};
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
    const nextPoint = newDestination?.length > 0 ? newDestination?.length - 1 : 0;
    params.push( `destination=${newDestination[nextPoint]}`);
    if(newDestination){
      params.push( `waypoints=optimize:true|${newDestination.join('|')}`);
    }
    if (state.index > 0) {
      const newOrigin = state.wayPoint[state.index - 1];
      const nextOriginPoint = newOrigin?.length > 0 ? newOrigin?.length - 1 : 0;
      params.push(`origin=${newOrigin[nextOriginPoint]}`);
    } else {
      const newOrigin = state.wayPoint[state.index];
      params.push(`origin=${newOrigin[0]}`);
    }

    const newUrl = `${url}${params.join('&')}`;
    fetch(newUrl)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.routes?.length > 0) {
          const route = responseJson?.routes[0];
					const newCoords = route?.legs?.reduce((carry, curr) => {
									return [
										...carry,
										...lineDecoder(curr.steps),
									];
								}, [])
          const coordinates = [...state.coordinates, ...newCoords];
          this.setState({
            coordinates,
            fare: route.fare,
						waypointOrder: route.waypoint_order,
          });
        }
        this.setState({ index: this.state.index + 1 }, () => {
          if (this.state.index <= state.wayPoint.length - 1) {
            this.getRoute();
          }else{
            this._promisessHandler.resolve();
            props.onFinish({
              coordinates: this.state.coordinates,
              fare: this.state.fare,
              waypointOrder: this.state.waypointOrder,
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
            this._promisessHandler.resolve();
          }
        });
      });
  };

  render() {
    const { coordinates, fare, waypointOrder } = this.state;
    if (!coordinates) {
      return null;
    }
    return this.props.renderLine({coordinates, fare, waypointOrder});
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
