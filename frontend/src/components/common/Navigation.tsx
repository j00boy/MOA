import React, {useState} from 'react';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FeatherIcon from 'react-native-vector-icons/Feather';
import styled, {useTheme} from 'styled-components/native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {Shadow} from 'react-native-shadow-2';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import {Alert} from 'react-native';
import {GroupDetailRouteProp, MomentDetailRouteProp} from '../../types/screen';
import {useRoute} from '@react-navigation/native';
import api from '../../utils/api';
import LoadingSpinner from './LoadingSpinner';

const MAX_IMAGES = 30;
const MAX_IMAGE_SIZE_MB = 10;

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
  z-index: 2;
`;

const Navigation: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleUploadPress = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 0,
    });
    if (result.didCancel || !result.assets || result.assets.length === 0) {
      return;
    }

    const selectedImages = result.assets.filter((image) => {
      if (!image.fileSize || image.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        Alert.alert(
          '사진 용량 초과',
          '10MB 이하의 사진만 업로드할 수 있습니다.',
        );
        return false;
      }

      return true;
    });

    if (selectedImages) {
      console.log(selectedImages.length);
      if (selectedImages.length > MAX_IMAGES) {
        Alert.alert('', '한 번에 30장까지만 업로드할 수 있습니다.');
        return;
      }

      const currentRoute = state.routes[state.index];
      const screenName = currentRoute.name;

      if (
        screenName === 'HomeStack' &&
        currentRoute.state?.index !== undefined
      ) {
        const nestedRoute =
          currentRoute.state?.routes[currentRoute.state.index];
        if (nestedRoute?.name === 'GroupDetail') {
          const params = nestedRoute.params as GroupDetailRouteProp['params'];
          if (params?.groupId) {
            uploadImage(true, params.groupId, selectedImages);
          }
        } else if (nestedRoute?.name === 'MomentDetail') {
          const params = nestedRoute.params as MomentDetailRouteProp['params'];
          if (params?.momentId) {
            uploadImage(false, params.momentId, selectedImages);
          }
        } else {
          navigation.navigate('Home');
        }
      } else {
        navigation.navigate('Home');
      }
    } else {
      console.log('uri 오류');
    }
  };

  const sendNotification = async (groupId: number) => {
    try {
      const response = await api.post('/alarm', groupId);

      if (response.data === 1) {
        console.log('푸시 알림 전송 성공');
      } else {
        console.warn('푸시 알림 전송 실패');
      }
    } catch (error) {
      console.error('푸시 알림 전송 중 오류:', error);
    }
  };

  const uploadImage = async (
    isGroup: boolean,
    id: string,
    selectedImages: Asset[],
  ) => {
    try {
      setLoading(true);

      const formData = new FormData();

      selectedImages.forEach((image) => {
        if (image) {
          formData.append('images', {
            uri: image.uri,
            type: image.type,
            name: image.fileName,
          });
        }
      });

      if (isGroup) {
        await api.post(`/group/${id}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: (data) => {
            return data;
          },
        });

        // 사진 업로드 성공 후 알림 전송
        await sendNotification(Number(id));

        Alert.alert('사진 공유 완료', '사진 공유가 완료되었습니다.');
        navigation.navigate('GroupDetail', {groupId: id});
      } else {
        const response = await api.get(`/moment/${id}/upload`);

        if (response?.data) {
          await api.post(`/moment/${id}/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data) => {
              return data;
            },
          });
          Alert.alert('', '사진 공유가 완료되었습니다.');
          navigation.navigate('MomentDetail', {momentId: id});
        } else {
          Alert.alert('', '관리자만 사진을 업로드할 수 있습니다.');
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert('', '사진 공유 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner />}
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
                      route.name === 'HomeStack'
                        ? 'folder-images'
                        : 'emoji-happy'
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
    </>
  );
};

export default Navigation;
