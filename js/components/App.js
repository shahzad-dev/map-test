import React from 'react';
import Relay from 'react-relay';
import HobbiesList from './units/Hobbies';

class App extends React.Component {
  render() {
    return (<div><HobbiesList Viewer={this.props.Viewer} /></div>)
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
