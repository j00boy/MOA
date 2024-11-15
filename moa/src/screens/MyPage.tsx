import {View, Alert} from 'react-native';
import React from 'react';
import ScreenContainer from '../components/common/ScreenContainer';
import styled, {css} from 'styled-components/native';
import MyInfo from '../components/mypage/MyInfo';
import FaceImage from '../components/mypage/FaceImage';
import Partition from '../components/common/Partition';
import {IconButton} from '../components/common/button/IconButton';
import {TextButton} from '../components/common/button/TextButton';
import api from '../utils/api';
import {logout} from '@react-native-seoul/kakao-login';
import {useAuthStore} from '../stores/authStores';
interface TextProps {
  variant: 'title' | 'subtitle' | 'body';
  color?: string;
}

const Texts = styled.Text<TextProps>`
  ${({variant, theme, color}) => {
    const textColor = color || theme.colors.black;
    switch (variant) {
      case 'title':
        return css`
          font-size: 22px;
          font-family: ${theme.fontFamily.SCDream8};
          color: ${textColor};
          margin: 0 0 10px 0;
        `;
      case 'subtitle':
        return css`
          font-size: 16px;
          font-family: ${theme.fontFamily.SCDream6};
          color: ${textColor};
        `;
      case 'body':
      default:
        return css`
          font-size: 13px;
          font-family: ${theme.fontFamily.SCDream4};
          color: ${textColor};
        `;
    }
  }}
`;

const Logout = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
`;

const Face = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const MyPage = () => {
  const {logout: storeLogout} = useAuthStore();
  // const getUserData = async () => { // 테스트 용
  //   try {
  //     const response = await api.get('/user');
  //     console.log('User Data:', response.data); // 성공 시 데이터 확인
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching user data:', error); // 에러 발생 시 로그 출력
  //   }
  // };

  const signOutWithKakao = async () => {
    try {
      await logout();
      await storeLogout();
      console.log('로그아웃!!!');
      Alert.alert('로그아웃 되었습니다.', '로그인 화면으로 이동합니다.');
    } catch (error) {
      console.error('Logout Failed', error);
    }
  };
  return (
    <ScreenContainer>
      <View>
        <Logout>
          <Texts variant="title">마이페이지</Texts>
          {/* <IconButton
            iconName="logout"
            // onPress={() => getUserData()}
            onPress={() => signOutWithKakao()}
          ></IconButton> */}
          <TextButton
            iconName="logout"
            backcolor="mainlightyellow"
            text="로그아웃"
            iconSet="Material"
            size="small"
            // onPress={() => getUserData()}
            onPress={() => signOutWithKakao()}
          />
        </Logout>
        <MyInfo />
      </View>
      <Partition />
      <Face>
        <FaceImage />
      </Face>
    </ScreenContainer>
  );
};

export default MyPage;
