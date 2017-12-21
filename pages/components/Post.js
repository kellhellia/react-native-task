import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';

class Post extends Component {
  render() {
    const {
      index,
      userAvatarUrl,
      userName,
      postImgUrl,
      postTitle
    } = this.props;

    return (
      <View key={index} style={style.post}>
        <View style={style.user}>
          <Image
            style={style.userAvatar}
            source={{uri: userAvatarUrl}}
            borderRadius={20}
          />

          <Text style={style.userName}>{userName}</Text>
        </View>

        <Image
          style={style.postImg}
          source={{uri: postImgUrl}}
        />

        {postTitle.length ? <Text style={style.postTitle}>{postTitle}</Text> : <View />}
      </View>
    );
  }
};

const style = {
  post: {
    marginBottom: 20,
    width: '100%'
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5
  },
  userAvatar: {
    width: 40,
    height: 40,
    marginRight: 10
  },
  userName: {
    fontWeight: 'bold'
  },
  postImg: {
    width: '100%',
    height: 400,
    marginBottom: 6
  },
  postTitle: {
    fontSize: 18,
    paddingLeft: 6,
    paddingRight: 6
  }
};

export default Post;