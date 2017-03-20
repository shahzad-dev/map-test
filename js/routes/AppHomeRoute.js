import Relay from 'react-relay';

export default class extends Relay.Route {
  static queries = {
    Viewer: () => Relay.QL`
      query {
        Viewer
      }
    `,
  };
  static routeName = 'AppHomeRoute';
}
