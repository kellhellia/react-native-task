import React, { Component } from 'react';
import {
    View,
    Text,
    Alert,
    TextInput,
    Platform,
    Button,
    Image,
    ActivityIndicator,
    TouchableHighlight
} from 'react-native';

import { TabNavigator } from 'react-navigation';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import * as firebase from 'firebase';

const options = {
  title: 'Select profile image',
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};

class Profile extends Component {
  static navigationOptions = {
    title: 'Profile',
    tabBarVisible: false
  };

  constructor() {
    super();

    this.state = {
      isEditable: false,
      name: 'Loading...',
      image_uri: 'https://www.1plusx.com/app/mu-plugins/all-in-one-seo-pack-pro/images/default-user-image.png',
      loaded: true
    };
  }

  componentDidMount() {
    const self = this;

    firebase.database().ref('userAvatarUrl').once('value').then((snapshot) => {
      self.setState({ image_uri: snapshot.val() });
    });

    // Get username
    firebase.database().ref('username').once('value').then(function(snapshot) {
      self.setState({ name: snapshot.val() });
    });
  }

  onNameClick() {
    const { isEditable } = this.state;
    this.setState({ isEditable: !isEditable });
  }

  onNameBlur(value) {
    this.setState({ isEditable: false });
    const { name } = this.state;
    firebase.database().ref('username').set(name);
  }

  uploadImage(uri, mime = 'application/octet-stream') {
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;

    return new Promise((resolve, reject) => {
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      let uploadBlob = null

      const imageRef = firebase.storage().ref('images').child('user_profile');

      fs.readFile(uploadUri, 'base64')
        .then((data) => {
          return Blob.build(data, { type: `${mime};BASE64` })
        })
        .then((blob) => {
          uploadBlob = blob
          return imageRef.put(blob, { contentType: mime })
        })
        .then(() => {
          uploadBlob.close()
          return imageRef.getDownloadURL();
        })
        .then((url) => {
          firebase.database().ref('userAvatarUrl').set(url);

          resolve(url);
        })
        .catch((error) => {
          reject(error);
      });
    })
  }

  getImage() {
    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {}
      else if (response.error) {}
      else if (response.customButton) {}
      else {
        this.setState({ loaded: false });

        this.uploadImage(response.uri)
          .then(url => { this.setState({ image_uri: url, loaded: true }); })
          .catch(error => console.log(error));
      }
    });
  }

  render() {
    const { isEditable, name, image_uri, loaded } = this.state;

    return (
      <View style={styles.main}>
        <View style={styles.userBlock}>
          <View style={{ marginBottom: 20 }}>
            {loaded ?
              (
                <TouchableHighlight onPress={this.getImage.bind(this)}>
                  <Image
                    source={{ uri: image_uri }}
                    style={{ width: 150, height: 150 }}
                    borderRadius={75}
                  />
                </TouchableHighlight>
              ) : (
                <View style={styles.userBlockLoader}>
                    <ActivityIndicator size="large" color="black" />
                </View>
              )
            }
          </View>

          {isEditable ?
            (
              <View style={styles.userBlockName}>
                <TextInput
                  onChangeText={(text) => this.setState({name: text})}
                  onBlur={this.onNameBlur.bind(this)}
                  value={name}
                  placeholder="Your name"
                  autoFocus={true}
                  caretHidden={false}
                  style={{ fontSize: 18 }}
                />
              </View>
            ) : (
              <View style={{ flexDirection: 'row' }}>
                <Text
                  style={{ fontSize: 18 }}
                  onPress={this.onNameClick.bind(this)}
                >
                  {name}
                </Text>
              </View>
            )
          }
        </View>

        <View style={styles.userBlockTip}>
          <Text>Tap to user image for upload new picture</Text>
          <Text>Tap to username, to change it</Text>
        </View>
      </View>
    );
  }
};

const styles = {
  main: {
    flex: 1,
    height: '100%',
    paddingTop: '6%'
  },
  userBlock: {
    flex: 1,
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  userBlockLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 150
  },
  userBlockName: {
    backgroundColor: 'transparent',
    borderColor: '#000000',
    borderWidth: 1,
    width: '50%'
  },
  userBlockTip: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  }
};

export default Profile;