import {
  PanResponder,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import styled from 'styled-components/native';
import ScreenContainer from '../components/common/ScreenContainer';
import MyGroupList from '../components/group/groupList/MyGroupList';
import MyMomentList from '../components/moment/momentList/MyMomentList';

const screenHeight = Dimensions.get('window').height;

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const ToggleContainer = styled.View`
  flex-direction: row;
  width: 100%;
  height: 40px;
  background-color: ${({theme}) => theme.colors.mediumgray};
  border-radius: 20px;
  padding: 4px;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
`;

const ToggleButton = styled(AnimatedTouchableOpacity)`
  position: absolute;
  width: 50%;
  height: 32px;
  background-color: ${({theme}) => theme.colors.mainlightyellow};
  border-radius: 16px;
`;

const OptionContainer = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const OptionButton = styled.TouchableOpacity`
  width: 50%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ToggleText = styled.Text<{isActive: boolean}>`
  font-family: 'SCDream5';
  font-size: 15px;
  color: ${({theme, isActive}) =>
    isActive ? theme.colors.maindarkorange : theme.colors.deepgray};
`;

const ScrollContainer = styled.ScrollView`
  height: ${screenHeight - 250}px;
`;

const ContentContainer = styled.View`
  padding-bottom: 100px;
  min-height: 200px;
`;

const Home = () => {
  const [isGroup, setIsGroup] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const togglePosition = useRef(new Animated.Value(4)).current;
  const [containerWidth, setContainerWidth] = useState(0);

  // PanResponder로 드래그 동작을 처리
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        const maxTranslateX = containerWidth / 2;
        if (gestureState.dx >= 0 && gestureState.dx <= maxTranslateX) {
          togglePosition.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        const maxTranslateX = containerWidth / 2;
        if (gestureState.dx > maxTranslateX / 2) {
          setIsGroup(false);
          Animated.spring(togglePosition, {
            toValue: maxTranslateX,
            useNativeDriver: false,
          }).start();
        } else {
          setIsGroup(true);
          Animated.spring(togglePosition, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const handleTogglePress = () => {
    const maxTranslateX = containerWidth / 2;
    setIsGroup(!isGroup);
    Animated.spring(togglePosition, {
      toValue: isGroup ? maxTranslateX : 4,
      useNativeDriver: false,
    }).start();
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <ScreenContainer>
      <ToggleContainer
        onLayout={(event) => {
          const {width} = event.nativeEvent.layout;
          setContainerWidth(width - 4);
        }}
      >
        <ToggleButton
          style={{transform: [{translateX: togglePosition}]}}
          {...panResponder.panHandlers}
          onPress={handleTogglePress}
        />
        <OptionContainer>
          <OptionButton onPress={() => handleTogglePress()}>
            <ToggleText isActive={isGroup}>나의 그룹</ToggleText>
          </OptionButton>
          <OptionButton onPress={() => handleTogglePress()}>
            <ToggleText isActive={!isGroup}>나의 순간</ToggleText>
          </OptionButton>
        </OptionContainer>
      </ToggleContainer>
      <ScrollContainer
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ContentContainer>
          {isGroup ? (
            <MyGroupList
              refreshing={refreshing}
              onRefresh={() => setRefreshing(false)}
            />
          ) : (
            <MyMomentList
              refreshing={refreshing}
              onRefresh={() => setRefreshing(false)}
            />
          )}
        </ContentContainer>
      </ScrollContainer>
    </ScreenContainer>
  );
};

export default Home;
