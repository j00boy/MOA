// src/components/common/login/LoginButton.tsx
import React, {useState, useEffect} from 'react';
import {Button, Alert, View, TouchableOpacity, Text} from 'react-native';
import {login, logout} from '@react-native-seoul/kakao-login';
import styled from 'styled-components/native';
import {TextButton} from '../button/TextButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuthStore} from '../../../stores/authStores';
import {useUserStore} from '../../../stores/userStores';
import {getFcmToken} from '../../../utils/FirebaseSettings';
import api from '../../../utils/api';

const ButtonContainer = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 60px;
  border-radius: 15px;
  background-color: #fee500;
  padding: 10px;
`;

const ButtonText = styled(Text)`
  color: #3c1e1e;
  font-size: 16px;
  margin-left: 8px;
`;

const LoginButton = () => {
  const [result, setResult] = useState<string | null>(null);
  const {setAuthenticated, logout: storeLogout} = useAuthStore();
  const {updateDeviceToken} = useUserStore();

  const signInWithKakao = async () => {
    try {
      const token = await login();
      const kakaoToken = token.accessToken;
      setResult(`Kakao Login Success: ${JSON.stringify(token)}`);
      console.log('카카오 로그인 성공. 액세스 토큰:', kakaoToken);

      if (kakaoToken) {
        console.log('토큰: ', result);
        console.log('access토큰: ', token.accessToken);
        console.log('refresh토큰: ', token.refreshToken);
        // onLoginSuccess(kakaoToken);

        // 1. 백엔드로 카카오 엑세스 토큰 전달
        await sendTokenToBackend(kakaoToken);

        // 2. 백엔드로 FCM 토큰 전달
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          await updateDeviceToken(fcmToken); // FCM 토큰을 백엔드로 업데이트
          console.log('토큰 백엔드로 보냈당', fcmToken);
        }
      } else {
        throw new Error('카카오 토큰 발급 못받음!');
      }
    } catch (error) {
      console.error('Login Failed', error);
      Alert.alert('로그인 실패', '다시 시도해주세요.');
    }
  };

  // 백엔드로 액세스 토큰 전송하고 JWT 엑세스 토큰 및 리프레시 토큰 받기
  const sendTokenToBackend = async (accessToken: string) => {
    try {
      // 토큰 헤더에 담아서 백엔드로 보내기
      const response = await api.post(
        '/kakao',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error('JWT Token 받기 실패');
      }

      // const jwtToken = response.data.token;
      const jwtAccessToken = response.data.accessToken;
      const jwtRefreshToken = response.data.refreshToken;

      console.log(
        'jwtToken 받음: ',
        jwtAccessToken,
        'refreshToken받음: ',
        jwtRefreshToken,
      );
      // console.log('jwt????? ', response);
      if (jwtAccessToken && jwtRefreshToken) {
        await setAuthenticated(true, {
          accessToken: jwtAccessToken,
          refreshToken: jwtRefreshToken,
        }); // JWT 토큰 저장 및 전역 상태 업데이트
      }
    } catch (error) {
      console.error('에러났다~~Error sending token to backend:', error);
    }
  };

  const signOutWithKakao = async () => {
    try {
      const message = await logout();
      setResult(`Kakao Logout: ${message}`);
      await storeLogout(); // 전역 상태와 AsyncStorage에서 JWT 토큰 제거
      console.log('로그아웃 결과: ', result, '토큰은? ', setResult);
    } catch (error) {
      console.error('Logout Failed', error);
      Alert.alert('로그아웃 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View>
      <ButtonContainer onPress={signInWithKakao}>
        <Ionicons name="chatbubble-sharp" size={24} color="#3c1e1e" />
        <ButtonText>카카오 로그인</ButtonText>
      </ButtonContainer>

      {/* <ButtonContainer onPress={signOutWithKakao}>
        <Ionicons name="chatbubble-sharp" size={24} color="#3c1e1e" />
        <ButtonText>카카오 로그아웃</ButtonText>
      </ButtonContainer> */}
    </View>
  );
};

export default LoginButton;
