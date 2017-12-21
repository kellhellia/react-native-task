import React, { Component } from 'react';
import {
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  View,
  Text,
  Button,
  Image
} from 'react-native';
import * as firebase from 'firebase';

import Post from './components/Post';

class Feed extends Component {
  static navigationOptions = {
    title: 'Feed',
    tabBarVisible: false
  };

  constructor() {
    super();

    this.state = {
      posts: [],
      loaded: false,
      name: '',
      userAvatarUrl: ''
    };
  }

  componentDidMount() {
    this.getPosts();
  }

  getPosts() {
    const self = this;

    firebase.database().ref('username').once('value').then((snapshot) => {
      self.setState({ name: snapshot.val() });
    });

    firebase.database().ref('userAvatarUrl').once('value').then((snapshot) => {
      self.setState({ userAvatarUrl: snapshot.val() });
    });

    this.setState({ loaded: false });

    let posts;
    let postsArray = [];

    firebase.database().ref('posts').once('value').then((snapshot) => {
      posts = snapshot.val();

      if (posts) {
        const postKeys = Object.keys(posts);

        if (postKeys.length) {
          postKeys.forEach((key, index) => {
            postsArray.push(posts[key]);
          });

          let reversedPosts = postsArray.reverse();

          self.setState({ posts: reversedPosts });
        }
      } else {
        self.setState({ posts: [] });
      }

      self.setState({ loaded: true });
    });
  }

  render() {
    const { posts, loaded, name, userAvatarUrl, initLoad } = this.state;
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.main}>
        <View style={styles.navBar}>
          <Text
            style={{ color: '#fff' }}
            onPress={() => navigate('Create')}
          >
            New post
          </Text>

          <Text
            style={{ color: '#fff' }}
            onPress={() => navigate('Profile')}
          >
            Profile
          </Text>
        </View>

        {initLoad && !loaded && (
          <View style={{ justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="black" />
          </View>
        )}

        <View style={styles.feed}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={!loaded}
                onRefresh={this.getPosts.bind(this)}
              />}
            style={styles.feedScroll}
          >

            {posts.length ? posts.map((post, index) => {
              return (
                <Post
                  key={index}
                  index={index}
                  userAvatarUrl={userAvatarUrl}
                  userName={name}
                  postImgUrl={post.imgUrl}
                  postTitle={post.title}
                />
              );
            }) : (
              <View style={styles.noPosts}>
                <Text>No posts yet</Text>
              </View>
            )}

          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = {
  main: {
    flex: 1,
    paddingTop: '6%'
  },
  navBar: {
    backgroundColor: '#222222',
    alignItems: 'flex-start',
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 6,
    paddingRight: 6
  },
  feed: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedScroll: {
    width: '100%',
    flex: 1,
    backgroundColor:'white'
  },
  noPosts: {
    padding: 6
  },
  noPostsText: {
    fontSize: 18
  }
}

export default Feed;