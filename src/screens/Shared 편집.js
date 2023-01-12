import React, {useState, useEffect, useRef, useCallback} from 'react';
import {View, ScrollView, Linking, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  AddCollectionCircle,
  Button,
  EditIcon,
  Input,
  ItemBox,
  SearchIcon,
  TempCircle,
} from '../components/Shared';
import {theme} from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Modal} from 'react-native';
import Ionic from 'react-native-vector-icons/Ionicons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {useIsFocused} from '@react-navigation/native';



// import AsyncStorage from '@react-native-async-storage/async-storage';

// import {useIsFocused} from '@react-navigation/native';

const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.mainBackground};
  padding-top: ${({insets: {top}}) => top}px;
  z-index: 100;
`;

const UpperContainer = styled.View`
  flex: 1;
  flex-direction: column;
  background-color: ${({theme}) => theme.mainBackground};
  padding: 0 5px;
`;

const BottomContainer = styled.View`
  flex: 2.7;
  flex-direction: row;
  background-color: ${({theme}) => theme.subBackground};
  padding: 10px;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
`;

const Row = styled.View`
  flex-direction: row;
`;

const SpackBetweenRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const FlexRow = styled.View`
  flex-direction: row;
  flex: 1;
  flex-wrap: wrap;
`;

const Column = styled.View`
  flex-direction: column;
  margin-left: 10px;
  margin-right: 10px;
`;

const Title = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({theme}) => theme.basicText};
`;

const SubTitle = styled.Text`
  margin-top: 3px;
  font-size: 12px;
  color: ${({theme}) => theme.subText};
`;

const TintPinkSubTitle = styled.Text`
  margin-top: 7px;
  font-size: 14px;
  color: ${({theme}) => theme.tintColorPink};
`;

const ModalView = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.mainBackground};
  padding-top: ${({insets: {top}}) => top}px;
  justify-content: center;
  align-items: center;
  opacity: 0.98;
`;
const ModalInnerView = styled.View`
  width: 100%;
  /* height: 15%; */
  background-color: ${({theme}) => theme.subBackground};
  border-radius: 20px;
  margin-top: -100px;
  padding: 20px;
  justify-content: center;
  align-items: center;
`;

const StyledTouchableOpacity = styled.TouchableOpacity`
  width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
`;

const Shared = (props) => {
  // Tab navigator route params check
  const nickName = props.route.params.params.nickName;
  console.log('shared screen name check',nickName);

  const insets = useSafeAreaInsets();
  const [visibleModal, setVisibleModal] = useState(false);
  const [shareCollections, setShareCollections] = useState([]); // 컬렉션 목록
  const [items, setItems] = useState([]); // 아이템 목록
  const [shareCollectionName, setShareCollectionName] = useState(''); // 컬렉션 개별 이름
  const [itemId, setItemId] = useState(0); // 아이템별 아이디
  const refChangedColname = useRef(null);
  const [loading, setLoading] = useState(false); // 로딩 및 로딩낭비 방지
  const isFocused = useIsFocused(); // 스크린 이동시 포커싱 및 useEffect 실행
  const [isEditing, setIsEditing] = useState(false);
  const [addToShareCollection, setAddToShareCollection] = useState([]);
  const [targetShareCollectionId, setTargetShareCollectionId] = useState('');
  const [isShareCollectionEditing, setIsShareCollectionEditing] = useState(false);
  // 공유 컬렉션 친구 추가
  const [isFriendselected, setIsFriendselected] = useState(false);
  const [addFriendList, setAddFriendList] = useState([]);


  // 화면이동시마다 랜더링 건들지 말것
  useEffect(() => {
    if (isFocused) console.log('Focused');
    _getShareCollections(); // 컬렌션 목록 랜더링
    _getItems(); // 아이템 목록 랜더링
  }, [isFocused]);

  // collection add
  const _madeShareCollection = async () => {
    console.log('nickName from Sign In', nickName); // 로그인 화면에서 받아온 닉네임 확인
    console.log('shareCollectionName', shareCollectionName); // 공유 컬렉션 이름 확인
    setVisibleModal(false);
    try {
      fetch('https://api.sendwish.link:8081/collection/shared', {
        method: 'POST',
        headers: {'Content-Type': `application/json`},
        body: JSON.stringify({
          memberIdList: addFriendList,
          targetCollectionId: targetShareCollectionId,
          title: shareCollectionName,
        }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`${response.status} 공유 컬렉션 생성 에러발생`);
          }
          return response.json();
        })
        .then(json => console.log(json))
        .then(data => {
          console.log('공유 컬렉션 생성:', data);
        })
        .then(() => _getShareCollections());
    } catch (e) {
      console.log('share collection made fail');
    }
  };

  // get collections
  const _getShareCollections = async () => {
    setLoading(true);
    try {
      fetch(`https://api.sendwish.link:8081/collections/shared/${nickName}`, {
        method: 'GET',
        headers: {Content_Type: 'application/json'},
        body: JSON.stringify({
          nickName: nickName,
        }),
      })
        .then(res => {
          return res.json();
        })
        .then(data => {
          setShareCollections(data);
          console.log('get share collections', data);
          setLoading(false);
        })
        .catch(error => {
          console.log(error);
        });
    } catch (e) {
      console.log(e);
    }
  };

  // item link
  const _openUrl = url => {
    console.log('url', url);
    Linking.openURL(url);
  };


  const _getItems = async () => {
    try {
      fetch(`https://api.sendwish.link:8081/items/${nickName}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      })
        .then(res => {
          return res.json();
        })
        .then(data => {
          setItems(data);
          console.log('========in share screen items :', data.imgUrl, data.name, data.price);
          console.log('======= get share screen items :', data);
        });
    } catch (e) {
      console.log(e);
    }
  };

  // collection 삭제
  const _deleteShareCollection = async () => {
    try {
      fetch(
        `https://api.sendwish.link:8081/collection/${nickName}/${collectionId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nickname: nickName,
            collectionId: collectionId,
          }),
        },
      )
        .then(response => {
          if (!response.ok) {
            throw new Error(`${response.status} 에러발생`);
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
        })
        .then(result => {
          console.log('result', result);
        });
    } catch (e) {
      console.log('delete fail', e);
    }
  };

  _pressEditButton = () => {
    isEditing ? setIsEditing(false) : setIsEditing(true);
  };

  _longPressCollection = () => {
    isShareCollectionEditing
      ? setIsShareCollectionEditing(false)
      : setIsShareCollectionEditing(true);
  };

  _addItemToShareList = itemId => {
    if (addToShareCollection.includes(itemId)) {
      tempArray = addToShareCollection;
      for (let i = 0; i < tempArray.length; i++) {
        if (tempArray[i] === itemId) {
          tempArray.splice(i, 1);
          i--;
        }
      }
      setAddToShareCollection(tempArray);
    } else {
      tempArray = addToCollection;
      tempArray.push(itemId);
      setAddToShareCollection(tempArray);
    }
  };

  _addFriendList  = friendId => {
    if (addFriendList.includes(friendId)) {
      friendArray = addFriendList;
      for (let i = 0; i < friendArray.length; i++) {
        if (friendArray[i] === friendId) {
          friendArray.splice(i, 1);
          i--;
        }
      }
      setAddFriendList(friendArray);
    } else {
      friendArray = addFriendList;
      friendArray.push(friendId);
      setAddFriendList(friendArray);
    }
  };


  _pressTargetCollection = async collectionId => {
    setIsEditing(false);
    try {
      fetch('https://api.sendwish.link:8081/item/enrollment', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          nickname: nickName,
          collectionId: collectionId,
          itemIdList: addToCollection,
        }),
      }).then(response => {
        if (!response.ok) {
          throw new Error(`${response.status} 에러발생`);
        }
        return response.json();
      });
      // .then(data => {
      //   console.log('data is : ', data);
      // });
    } catch (e) {
      console.log('adding item to collection failed');
    }
  };

  const _deleteItems = async () => {
    try {
      fetch(`https://api.sendwish.link:8081/items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: nickName,
          itemIdList: addToCollection,
        }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`${response.status} 에러발생`);
          }
          return response.json();
        })
        .then(data => {
          console.log(data);
        })
        .then(result => {
          console.log('result', result);
        })
        .then(_getItems)
        .then(setAddToCollection([]));
    } catch (e) {
      console.log('items delete fail', e);
    }
  };

  return (
    <Container insets={insets}>
      <Modal animationType="slide" transparent={true} visible={visibleModal}>
        <ModalView insets={insets}>
          <StyledTouchableOpacity
            onPress={() => setVisibleModal(false)}
            style={{marginLeft: 5}}>
            <Ionic name="chevron-back" size={25} color={theme.basicText} />
          </StyledTouchableOpacity>
          <KeyboardAwareScrollView extraScrollHeight={200}>
            <StyledTouchableOpacity
              onPress={() => setVisibleModal(false)}></StyledTouchableOpacity>
            <View style={{marginTop: 60}} />
            <View
              style={{
                width: '100%',
                justifyContent: 'flex-start',
              }}>
              <View style={{width: 330}}>
                <Title style={{marginBottom: 10}}>공유 콜렉션 만들기</Title>
                <Title>콜렉션의 이름을 입력해주세요.</Title>
                <TintPinkSubTitle>
                  공유 콜렉션의 이름을 입력해주세요.
                </TintPinkSubTitle>
              </View>
            </View>
            <Input
              ref={refChangedColname}
              value={collectionName}
              onChangeText={setCollectionName}
              onBlur={() => setCollectionName(collectionName)}
              maxLength={20}
              onSubmitEditing={() => {
                _madeCollection();
              }}
              placeholder="새 콜렉션 이름"
              returnKeyType="done"
            />
            <View style={{position: 'relative'}}>
              <ModalInnerView>
                <ScrollView horizontal style={{height: 100}}>
                  {/* 임시 */}
                  <TempCircle
                    frName={'유수민'}
                    imageStyle={{
                      opacity: isFriendselected ? 1 : 0.5,
                      position: 'absolute',
                    }}
                    titleStyle={{
                      color: isFriendselected ? theme.subText : theme.basicText,
                    }}
                    // key={friend?.friend_id}
                    // friendName={friend?.friend_nickname}
                    // nickName={friend?.nickName}
                    onPress={() => {
                      setIsFriendselected(!isFriendselected);
                      console.log('선택확인',isFriendselected);
                       addFriendList();
                    }}
                    isClicked={isFriendselected}
                  />
                  <TempCircle frName={'유수민'} />
                  <TempCircle frName={'유수민'} />
                </ScrollView>
              </ModalInnerView>
            </View>
            <Button
              title="새 콜렉션 만들기"
              onPress={() => _madeCollection()}
            />
          </KeyboardAwareScrollView>
        </ModalView>
      </Modal>
      <UpperContainer>
        <Row>
          <Column>
            <Title
              style={{
                marginTop: 30,
                color: isEditing ? theme.strongSubText : theme.basicText,
              }}>
              <Title
                style={{
                  fontSize: 27,
                  color: isEditing
                    ? theme.tintcolorPalegreen
                    : theme.tintColorGreen,
                }}>
                {nickName + ' '}
              </Title>
              님의 공유 컬렉션
            </Title>
          </Column>
        </Row>
        <Row>
          <View style={{height: 150}}>
            <View
              style={{
                widh: '100%',
                marginLeft: 10,
                marginRight: 10,
                height: 300,
              }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {/* collection rendering */}
                {/* {collections.error
                  ? null
                  : collections.map(collection => (
                      <CollectionCircle
                        imageStyle={{
                          opacity: isEditing ? 0.5 : 1,
                          position: 'absolute',
                        }}
                        titleStyle={{
                          color: isEditing ? theme.subText : theme.basicText,
                        }}
                        key={collection?.collectionId}
                        collectionId={collection?.collectionId}
                        collectionTitle={collection?.title}
                        nickName={collection?.nickname}
                        onPress={() =>
                          isEditing
                            ? _pressTargetCollection(collection?.collectionId)
                            : navigation.navigate('Collection', {
                                collectionId: collection?.collectionId,
                                collectionName: collection?.title,
                                nickName: collection?.nickname,
                              })
                        }
                        onLongPress={() => {
                          _longPressCollection();
                        }}
                        onPress2={() =>
                          isEditing
                            ? _getCollections()
                            : navigation.navigate('Collection', {
                                collectionId: collection?.collectionId,
                                collectionName: collection?.title,
                                nickName: collection?.nickname,
                              })
                        }
                      />
                    ))} */}

                <Ionicons
                  name="ellipsis-vertical"
                  size={15}
                  style={{
                    marginTop: 45,
                    marginLeft: 10,
                    color: isEditing
                      ? theme.subBackground
                      : theme.componentBackground,
                  }}
                />
                <AddCollectionCircle
                  imageStyle={{
                    backgroundColor: isEditing
                      ? theme.subBackground
                      : theme.componentBackground,
                  }}
                  titleStyle={{
                    color: isEditing ? theme.subText : theme.basicText,
                  }}
                  onPress={() => (isEditing ? {} : setVisibleModal(true))}
                  title="새 콜렉션 추가"></AddCollectionCircle>
              </ScrollView>
            </View>
          </View>
        </Row>
      </UpperContainer>

      <BottomContainer
        style={{
          backgroundColor: isEditing
            ? theme.strongBackground
            : theme.subBackground,
        }}>
        <ScrollView scrollEnabled={true}>
          <Column>
            <SpackBetweenRow>
              <View style={{marginBottom: 10}}>
                <Title
                  style={{
                    color: isEditing ? theme.strongSubText : theme.basicText,
                  }}>
                  내 위시템 전체보기
                </Title>
                <SubTitle
                  style={{
                    color: isEditing ? theme.strongSubText : theme.subText,
                  }}>
                  총 {items.length}개의 위시템
                </SubTitle>
              </View>
              <Row>
                <SearchIcon style={{opacity: isEditing ? 0 : 1}} />
                {/* <FilterIcon /> */}
                <EditIcon
                  onPress={() => _pressEditButton()}
                  name={isEditing ? 'x' : 'edit-2'}
                />
              </Row>
            </SpackBetweenRow>
          </Column>
          <FlexRow>
            {/* item rendering  */}
            {items.error
              ? null
              : items.map(item => (
                  <ItemBox
                    imageStyle={{
                      opacity: isEditing ? 0.1 : 1,
                    }}
                    titleStyle={{
                      color: isEditing ? theme.subText : theme.basicText,
                    }}
                    priceStyle={{
                      color: isEditing
                        ? theme.tintcolorPalepink
                        : theme.tintColorPink,
                    }}
                    key={item?.itemId}
                    saleRate="가격"
                    itemName={item?.name}
                    itemPrice={new String(item?.price).replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ',',
                    )}
                    itemImage={item?.imgUrl}
                    itemId={item?.itemId}
                    onPress={() => {
                      isEditing
                        ? _addItemToShareList(item?.itemId)
                        : _openUrl(item?.originUrl);
                    }}
                    isEditing={isEditing}
                  />
                ))}
          </FlexRow>
        </ScrollView>
      </BottomContainer>

      <View
        style={{
          position: 'absolute',
          top: '86%',
          width: '100%',
          height: '00%',
          paddingLeft: 20,
          paddingRight: 20,
          display: isEditing ? 'flex' : 'none',
        }}>
        <Button
          style={{
            marginBottom: 0,
            position: 'absolute',
          }}
          buttonStyle={{backgroundColor: theme.tintColorPink}}
          title="삭제하기"
          onPress={() => {
            _deleteItems();
          }}
        />
      </View>
    </Container>
  );
};

export default Shared;
