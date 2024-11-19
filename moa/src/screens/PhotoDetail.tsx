/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import ScreenContainer from '../components/common/ScreenContainer';
import styled from 'styled-components/native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types/screen';
import {Dimensions, Image} from 'react-native';
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';

const windowWidth = Dimensions.get('window').width * 0.88;
const windowHeight = Dimensions.get('window').height - 80;

const StyledImage = styled(Animated.createAnimatedComponent(FastImage))`
  margin: auto;
`;

type PhotoDetailRouteProp = RouteProp<RootStackParamList, 'PhotoDetail'>;

const PhotoDetail = () => {
  const route = useRoute<PhotoDetailRouteProp>();
  const uri = route.params.uri;
  const [aspectRatio, setAspectRatio] = React.useState(1);

  // Zoom 관련 애니메이션 값
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (uri) {
      Image.getSize(uri, (width, height) => {
        setAspectRatio(width / height);
      });
    }
  }, [uri]);

  // Pinch Gesture 생성
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = event.scale;
    })
    .onEnd(() => {
      scale.value = withTiming(1, {duration: 200});
    });

  // 이미지에 적용할 애니메이션 스타일
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  // 동적으로 이미지 크기 계산
  const calculateImageSize = () => {
    if (aspectRatio > 1) {
      // 가로가 더 긴 이미지
      const width = Math.min(windowWidth, windowHeight * aspectRatio);
      const height = width / aspectRatio;
      return {width, height};
    } else {
      // 세로가 더 긴 이미지
      const height = Math.min(windowHeight, windowWidth / aspectRatio);
      const width = height * aspectRatio;
      return {width, height};
    }
  };

  const {width, height} = calculateImageSize();

  return (
    <ScreenContainer>
      <GestureHandlerRootView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
      >
        <GestureDetector gesture={pinchGesture}>
          <StyledImage
            source={{uri}}
            style={[
              animatedStyle,
              {
                width,
                height,
              },
            ]}
            resizeMode={FastImage.resizeMode.contain}
          />
        </GestureDetector>
      </GestureHandlerRootView>
    </ScreenContainer>
  );
};

export default PhotoDetail;
