import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import Map from './shared/Map';

import Relay from 'react-relay';
import HobbiesList from './units/Hobbies';

const K_WIDTH = 40;
const K_HEIGHT = 40;

const greatPlaceStyle = {
  // initially any map object has left top corner at lat lng coordinates
  // it's on you to set object origin to 0,0 coordinates
  position: 'absolute',
  width: K_WIDTH,
  height: K_HEIGHT,
  left: -K_WIDTH / 2,
  top: -K_HEIGHT / 2,

  border: '5px solid #f44336',
  borderRadius: K_HEIGHT,
  backgroundColor: 'white',
  textAlign: 'center',
  color: '#3f51b5',
  fontSize: 16,
  fontWeight: 'bold',
  padding: 4
};


const AnyReactComponent = ({ text }) => <div style={greatPlaceStyle}>{text}</div>;

class App extends Component {
    static defaultProps = {
    center: {lat: 43.66, lng: -79.37},
    zoom: 13
  };
  render() {
    return (
    <div style={{width: 500, height: 500}}>
        <GoogleMapReact
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
            bootstrapURLKeys={{key: "AIzaSyDKaX_1KQZze5IAmnKFPYAQoZWZX4aLxrE"}}
          >
            <AnyReactComponent
              lat={43.661921}
              lng={-79.375844}
              text={'A'}
            />
          </GoogleMapReact>
      </div>)
  }
}

export default Relay.createContainer(App, {
  fragments: {
    Viewer: () => Relay.QL`
      fragment on Viewer {
        id,
        ${HobbiesList.getFragment('Viewer')},
      }
    `,
  },
});
