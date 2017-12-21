import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  Platform,
  Button,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableHighlight
} from 'react-native';
import { TabNavigator } from 'react-navigation';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'react-native-fetch-blob';
import * as firebase from 'firebase';
import GestureRecognizer, { swipeDirections } from 'react-native-swipe-gestures';

const photoCamIconUrl = 'https://reba.global/files/img_cache/3405/__1__1no-image.png?1493726454';

class Create extends Component {
  static navigationOptions = {
    title: 'Create',
    tabBarVisible: false
  };

  constructor() {
    super();
    this.state = {
      image: '',
      username: '',
      userAvatarUrl: '',
      uploadedImageUrl: '',
      postTitle: '',
      postKey: '',
      imageLoaded: false,
      loaded: true
    };
  }

  componentWillMount() {
    const self = this;

    firebase.database().ref('username').once('value').then((snapshot) => {
      self.setState({ username: snapshot.val() });
    });

    firebase.storage().ref('images').child('user_profile').getDownloadURL().then((url) => {
      self.setState({ userAvatarUrl: url });
    });

    this.setState({ uploadedImageUrl: photoCamIconUrl });
  }

  uploadImage(uri, mime = 'application/octet-stream') {
    const Blob = RNFetchBlob.polyfill.Blob;
    const fs = RNFetchBlob.fs;
    window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
    window.Blob = Blob;
    const self = this;

    return new Promise((resolve, reject) => {
      const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
      let uploadBlob = null;

      let imageCounter;
      let imageRef;

      firebase.database().ref('imageCounter').once('value').then(function(snapshot) {
        imageCounter = snapshot.val();
      }).then(() => {
        imageRef = firebase.storage().ref('images').child(`image-${imageCounter}`);
      });

      fs.readFile(uploadUri, 'base64')
        .then((data) => {
          return Blob.build(data, { type: `${mime};BASE64` });
        })
        .then((blob) => {
          uploadBlob = blob;
          return imageRef.put(blob, { contentType: mime });
        })
        .then(() => {
          uploadBlob.close();
          return imageRef.getDownloadURL();
        })
        .then((url) => {
          self.setState({ uploadedImageUrl: url });

          const postKey = firebase.database().ref('posts').push({
            imgUrl: url,
            title: ''
          }).key;

          self.setState({ postKey, imageLoaded: true });

          imageCounter = +imageCounter + 1;
          firebase.database().ref('imageCounter').set(imageCounter);

          resolve(url);
        })
        .catch((error) => {
          reject(error);
      });
    });
  }

  getImage() {
    ImagePicker.showImagePicker({
      title: 'Select profile image',
        storageOptions: {
          skipBackup: true,
          path: 'images'
        }
      }, (response) => {
        if (response.didCancel) {}
        else if (response.error) {}
        else if (response.customButton) {}
        else {
          this.setState({ loaded: false });
          this.uploadImage(response.uri)
            .then(url => { this.setState({ image: url, loaded: true}) })
            .catch(error => console.log(error));
        }
      });
  }

  onPostTitleBlur() {
    let post;
    const { postKey, postTitle } = this.state;

    firebase.database().ref(`posts/${postKey}`).once('value').then(function(snapshot) {
        post = snapshot.val();
    }).then(() => {
      post.title = postTitle;

      firebase.database().ref(`posts/${postKey}`).set(post);
    });
  }

  onSwipe(gestureName, gestureState) {
    const { SWIPE_LEFT } = swipeDirections;
    const self = this;

    switch (gestureName) {

    // Clear state, if user left Create-screen

    case SWIPE_LEFT:
      setTimeout(() => {
        self.setState({
          uploadedImageUrl: photoCamIconUrl,
          image: '',
          postTitle: '',
          postKey: '',
          imageLoaded: false,
          loaded: true
        });
      }, 1000);
      break;
    }
  }

  render() {
    const {
      image,
      uploadedImageUrl,
      username,
      userAvatarUrl,
      postTitle,
      imageLoaded,
      loaded
    } = this.state;

    return (
      <GestureRecognizer
        onSwipe={this.onSwipe.bind(this)}
        style={styles.main}
      >
        <ScrollView style={styles.scroll}>
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.heading}>Create new post</Text>

            <Text>Tap to picture for image upload</Text>
          </View>

          <View style={styles.createImageBlock}>
            {loaded ?
              (<TouchableHighlight style={{ width: '100%', height: 350 }} onPress={this.getImage.bind(this)}>
                <Image
                  source={{ uri: uploadedImageUrl }}
                  style={{ width: '100%', height: '100%' }}
                />
               </TouchableHighlight>) :
              (<View style={styles.createImageBlockLoader}>
                <ActivityIndicator size="large" color="black" />
               </View>)
            }
          </View>

          {imageLoaded && (
            <TextInput
              placeholder="Add text to your post (data saves automatically)"
              onChangeText={(text) => this.setState({ postTitle: text })}
              onBlur={this.onPostTitleBlur.bind(this)}
              value={postTitle}
              caretHidden={false}
              style={{fontSize: 18}}
            />
          )}
        </ScrollView>
      </GestureRecognizer>
    );
  }
}

const styles = {
  main: {
    flex: 1,
    paddingTop: '6%',
    paddingLeft: 6,
    paddingRight: 6
  },
  scroll: {
    width: '100%',
    flex: 1,
    backgroundColor:'white'
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  createImageBlock: {
    marginBottom: 10,
    width: '100%',
    height: 350,
    alignItems: 'center',
    justifyContent: 'center'
  },
  createImageBlockLoader: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70
  }
}

export default Create;