import React, { Component } from 'react';
import { lineDecoder, foxArray, getLocation, WaitingFrameRefresh } from './LazyFoxUtils';
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
      this._index = 0;
      this.init(props);
    }
  };

  _promisessHandler = {resolve:()=>null, reject:()=>null};
  _index: 0;
  init = async(props) => {
    this.props.onStart(true);
    this._promisessHandler.reject();
    const tempWayPoint =  await foxArray(getLocation(props.wayPoint)).chunk(props.wayPointLimit) ;
    this.setState({ 
      wayPoint: tempWayPoint,
      coordinates: [],
      fare: [],
      waypointOrder: [],
      location: tempWayPoint,
    });
    this._index = 0;
    if (props.wayPoint.length >= 2) {
      new Promise((resolve, reject) => {
        this._promisessHandler = {resolve, reject};
        this.getRoute();
      })
    }else{
      this.props.onError(true);
    }
  };

  getRoute = async() => {
    new WaitingFrameRefresh();
    const { props, state } = this;
    const url = 'https://maps.googleapis.com/maps/api/directions/json?';
    const params = [
      `key=${props.apiKey}`,
      `mode=${props.mode}`,
    ];
    const newDestination = state.wayPoint[this._index];
    const nextPoint = newDestination?.length > 0 ? newDestination?.length - 1 : 0;
    params.push( `destination=${newDestination[nextPoint]}`);
    if(newDestination){
      params.push( `waypoints=optimize:true|${newDestination.join('|')}`);
    }
    if (this._index > 0) {
      const newOrigin = state.wayPoint[this._index - 1];
      const nextOriginPoint = newOrigin?.length > 0 ? newOrigin?.length - 1 : 0;
      params.push(`origin=${newOrigin[nextOriginPoint]}`);
    } else {
      const newOrigin = state.wayPoint[this._index];
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
        if(this._index + 1 < state.wayPoint.length - 1){
          this._index +=1;
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
      })
      .catch((e) => {
        console.warn(e);
        if(this._index + 1 < state.wayPoint.length - 1){
          this._index +=1;
          this.getRoute();
        }else{
          props.onError(e);
          this._promisessHandler.resolve();
        }
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
  renderLine: () => null,
  onStart:() => null
};
export { LazyfoxMapDirection };
