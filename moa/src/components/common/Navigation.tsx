import React from 'react';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import styled, {useTheme} from 'styled-components/native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Shadow} from 'react-native-shadow-2';
import {launchImageLibrary} from 'react-native-image-picker';
import {Alert} from 'react-native';
import {GroupDetailRouteProp, MomentDetailRouteProp} from '../../types/screen';
import {useRoute} from '@react-navigation/native';
import api from '../../utils/api';

const Container = styled.View`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const BoxContainer = styled.View`
  height: 80px;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 10%;
  background-color: ${({theme}) => theme.colors.white};
`;

const StyledShadow = styled(Shadow).attrs({
  distance: 10,
  startColor: 'rgba(0, 0, 0, 0.1)',
})`
  width: 100%;
  background-color: ${({theme}) => theme.colors.white};
`;

interface NavButtonProps {
  isActive: boolean;
}

const NavButtonContainer = styled.TouchableOpacity<NavButtonProps>`
  display: flex;
  align-items: center;
  height: 55px;
  justify-content: space-between;
`;

const NavButtonText = styled.Text<NavButtonProps>`
  font-family: ${({isActive}) => (isActive ? 'SCDream6' : 'SCDream4')};
  font-size: 15px;
  color: ${({theme, isActive}) =>
    isActive ? theme.colors.maindarkorange : theme.colors.deepgray};
`;

const ShareButton = styled.TouchableOpacity`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({theme}) => theme.colors.maindarkorange};
  width: 70px;
  height: 70px;
  border-radius: 50px;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-35px, -35px);
  z-index: 1;
`;

const Navigation: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  const theme = useTheme();

  const handleUploadPress = async () => {
    const route = state.routes[state.index];
    const screenName = route.name;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });
    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const selectedImages = result.assets;

    for (const image of selectedImages) {
      if (image.uri) {
        if (screenName === 'HomeStack' && route.state?.index !== undefined) {
          const nestedRoute = route.state?.routes[route.state.index];
          if (nestedRoute && nestedRoute.name === 'GroupDetail') {
            const params = nestedRoute.params as GroupDetailRouteProp['params'];
            if (params?.groupInfo?.groupId) {
              // GroupDetail에 있을 때 업로드 로직
              uploadImageToGroup(params.groupInfo.groupId, image.uri);
            }
          } else if (nestedRoute && nestedRoute.name === 'MomentDetail') {
            const params =
              nestedRoute.params as MomentDetailRouteProp['params'];
            if (params?.momentId) {
              // MomentDetail에 있을 때 업로드 로직
              uploadImageToMoment(params.momentId, image.uri);
            }
          } else {
            // Home으로 이동 -> 나중에 Home 선택모드로 이동
            navigation.navigate('Home');
          }
        } else {
          // 다른 탭에서도 Home 선택모드로 이동
          navigation.navigate('Home');
        }
      } else {
        console.log('uri 오류');
      }
    }
  };

  const uploadImageToGroup = async (groupId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      console.log('api 진입');
      // 나중에 api 수정 예정
      const response = await fetch(`YOUR_SERVER_URL/groups/${groupId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (response.ok) {
        Alert.alert('사진 공유 완료', '');
      } else {
        Alert.alert('사진 공유 실패', '');
      }
    } catch (error) {
      console.error('Group Upload Error:', error);
      Alert.alert('사진 공유 실패', '');
    }
  };

  const uploadImageToMoment = async (momentId: string, imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });
      const response = await fetch(
        `YOUR_SERVER_URL/moments/${momentId}/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        },
      );
      if (response.ok) {
        Alert.alert('사진 공유 완료', '');
      } else {
        Alert.alert('사진 공유 실패', '');
      }
    } catch (error) {
      console.error('Moment Upload Error:', error);
      Alert.alert('사진 공유 실패', '');
    }
  };

  return (
    <Container>
      <ShareButton onPress={handleUploadPress}>
        <FeatherIcon name={'upload'} size={30} color={theme.colors.white} />
      </ShareButton>
      <StyledShadow>
        <BoxContainer>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <NavButtonContainer
                key={route.key}
                onPress={onPress}
                isActive={isFocused}
              >
                <EntypoIcon
                  name={
                    route.name === 'HomeStack' ? 'folder-images' : 'emoji-happy'
                  }
                  size={30}
                  color={
                    isFocused
                      ? theme.colors.maindarkorange
                      : theme.colors.deepgray
                  }
                />
                <NavButtonText isActive={isFocused}>
                  {route.name === 'HomeStack' ? '모아' : '마이'}
                </NavButtonText>
              </NavButtonContainer>
            );
          })}
        </BoxContainer>
      </StyledShadow>
    </Container>
  );
};

export default Navigation;
