import styled from 'styled-components';
import React, {useEffect, useState} from 'react';
import {TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {theme} from '../../theme';

const Container = styled.View`
  padding: 10px;
  margin: 40px 10px 10px 10px;
  width: 65px;
  height: 65px;
  justify-content: center;
  align-items: center;
  border-radius: 75px;
`;

const CollectionImage = styled.Image`
  background-color: ${({theme}) => theme.componentBackground};
  padding: 10px;
  margin: 10px 10px 10px 10px;
  width: 75px;
  height: 75px;
  justify-content: center;
  align-items: center;
  border-radius: 30px;
  border-color: ${({theme}) => theme.line};
`;

const CollectionView = styled.View`
  background-color: ${({theme}) => theme.tintColorPink};
  padding: 10px;
  margin: 10px 10px 10px 10px;
  width: 75px;
  height: 75px;
  justify-content: center;
  align-items: center;
  border-radius: 30px;
  border-color: ${({theme}) => theme.line};
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 11px;
  font-weight: bold;
  color: ${({theme}) => theme.basicText};
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 80px;
  height: 30px;
`;

const CollectionCircle = ({
  onPress,
  collectionTitle,
  imageStyle,
  imageStyle2,
  titleStyle,
  nickName,
  collectionId,
  onLongPress,
  isCollectionEditing,
  isEditing,
}) => {
  const [items, setItems] = useState([]);
  const [imageUrl, setImageUrl] = useState('https://i.imgur.com/6XzJjYm.png');
  const isFocused = useIsFocused(); // 스크린 이동시 포커싱 및 useEffect 실행

  useEffect(() => {
    _setImageUrl();
  }, [items]);

  const _getItemsFromCollection = async () => {
    try {
      fetch(
        `https://api.sendwish.link:8081/collection/${nickName}/${collectionId}`,
        {
          method: 'GET',
          headers: {'Content-Type': 'application/json'},
        },
      )
        .then(res => {
          return res.json();
        })
        .then(data => {
          if (!data.nickname) {
            return;
          }
          setItems(data.dtos);
          console.log(items);
        })
        .then(_setImageUrl);
    } catch (e) {
      console.log(e);
    }
  };

  const _setImageUrl = () => {
    if (items.length > 0) {
      setImageUrl(items[0].imgUrl);
    }
  };

  const _onPress = () => {
    onPress();
    _getItemsFromCollection();
    _setImageUrl();
  };

  return (
    <Container>
      <TouchableHighlight
        onPress={_onPress}
        onLongPress={onLongPress}
        style={{opacity: isEditing ? 0.5 : 1}}>
        <View>
          <CollectionImage
            source={{uri: imageUrl}}
            style={{display: isCollectionEditing ? 'none' : 'flex'}}
          />
          <View
            style={{
              display: isCollectionEditing ? 'flex' : 'none',
            }}>
            <CollectionView>
              <CollectionImage
                source={{uri: imageUrl}}
                style={{opacity: 0.5}}
              />
            </CollectionView>
            <View
              style={{
                borderRadius: 100,
                position: 'absolute',
                marginLeft: 55,
                marginTop: 3,
                backgroundColor: theme.mainBackground,
                opacity: 0.7,
              }}>
              <Feather name="minus-circle" size={30} color="white" />
            </View>
          </View>
          <Row>
            <Title style={titleStyle}>{collectionTitle}</Title>
          </Row>
        </View>
      </TouchableHighlight>
    </Container>
  );
};

export default CollectionCircle;
