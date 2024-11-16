/* eslint-disable react-native/no-inline-styles */
// src/screens/KakaoTestScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  login,
  logout,
  getProfile,
  shippingAddresses,
  serviceTerms,
  unlink,
} from '@react-native-seoul/kakao-login';
import LoginButton from '../components/common/login/LoginButton';
import styled from 'styled-components/native';
import ScreenContainer from '../components/common/ScreenContainer';

const Container = styled.View`
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const LogoContainer = styled.View`
  flex-direction: column;
  height: 170px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 120px;
`;

const Logo = styled.Image`
  width: 160px;
  height: 110px;
`;

const Explain = styled.Text`
  font-family: ${(props) => props.theme.fontFamily.SCDream5};
  color: ${(props) => props.theme.colors.darkyellow};
  font-size: 16px;
`;

const Login = () => {
  // const [result, setResult] = useState<string | null>(null);

  // const signInWithKakao = async () => {
  //   try {
  //     const token = await login();
  //     setResult(`Kakao Login Success: ${JSON.stringify(token)}`);
  //   } catch (error) {
  //     console.error('Login Failed', error);
  //     Alert.alert('Login Failed', 'Please try again.');
  //   }
  // };

  // const signOutWithKakao = async () => {
  //   try {
  //     const message = await logout();
  //     setResult(`Kakao Logout: ${message}`);
  //   } catch (error) {
  //     console.error('Logout Failed', error);
  //     Alert.alert('Logout Failed', 'Please try again.');
  //   }
  // };

  // const getKakaoProfile = async () => {
  //   try {
  //     const profile = await getProfile();
  //     setResult(`Kakao Profile: ${JSON.stringify(profile)}`);
  //   } catch (error) {
  //     console.error('Get Profile Failed', error);
  //     Alert.alert('Failed to retrieve profile');
  //   }
  // };

  // const getKakaoShippingAddresses = async () => {
  //   try {
  //     const addresses = await shippingAddresses();
  //     setResult(`Shipping Addresses: ${JSON.stringify(addresses)}`);
  //   } catch (error) {
  //     console.error('Get Shipping Addresses Failed', error);
  //     Alert.alert('Failed to retrieve shipping addresses');
  //   }
  // };

  // const getKakaoServiceTerms = async () => {
  //   try {
  //     const terms = await serviceTerms();
  //     setResult(`Service Terms: ${JSON.stringify(terms)}`);
  //   } catch (error) {
  //     console.error('Get Service Terms Failed', error);
  //     Alert.alert('Failed to retrieve service terms');
  //   }
  // };

  // const unlinkKakao = async () => {
  //   try {
  //     const message = await unlink();
  //     setResult(`Unlink Kakao Account: ${message}`);
  //   } catch (error) {
  //     console.error('Unlink Failed', error);
  //     Alert.alert('Unlink Failed');
  //   }
  // };

  return (
    <ScreenContainer>
      <Container>
        <LogoContainer>
          <Logo source={require('../assets/images/MOA_logo.png')} />
          <Explain>소중한 순간, 쉽고 빠르게 나눠요</Explain>
        </LogoContainer>
        <LoginButton />
        {/* <Button title="Login with Kakao" onPress={signInWithKakao} />
      <Button title="Logout from Kakao" onPress={signOutWithKakao} />
      <Button title="Get Kakao Profile" onPress={getKakaoProfile} />
      <Button
        title="Get Kakao Shipping Addresses"
        onPress={getKakaoShippingAddresses}
      />
      <Button title="Get Kakao Service Terms" onPress={getKakaoServiceTerms} />
      <Button title="Unlink Kakao Account" onPress={unlinkKakao} />
      <Text style={{marginTop: 20}}>{result}</Text> */}
      </Container>
    </ScreenContainer>
  );
};

export default Login;
