import React from 'react';
import { View, Text } from 'react-native';
import { TabNavigator } from 'react-navigation';

import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Create from './pages/Create';

import * as firebase from 'firebase';

class RouterTabs extends React.Component {
  componentWillMount() {
    const config = {
      apiKey: "AIzaSyAY9rycxU9vT-Yat4cNoTPZWNEiqmVt-N0",
      authDomain: "testtaskbackend.firebaseapp.com",
      databaseURL: "https://testtaskbackend.firebaseio.com",
      projectId: "testtaskbackend",
      storageBucket: "testtaskbackend.appspot.com",
      messagingSenderId: "808630786044"
    };

    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if (!firebaseUser) {
        firebase.auth().signInWithEmailAndPassword('avocadouser@gmail.com', '000000');
      }
    });
  }

  render() {
    const TabNav = TabNavigator({
      Create: {
        screen: Create,
      },
      Feed: {
        screen: Feed
      },
      Profile: {
        screen: Profile
      }
    }, {
        animationEnabled: true,
        swipeEnabled: true,
        initialRouteName: 'Feed'
    });

    return (
      <TabNav />
    );
  }
}

export default RouterTabs;