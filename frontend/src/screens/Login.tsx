// src/screens/KakaoTestScreen.tsx
import React, {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
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
  height: 210px;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 120px;
`;

const Logo = styled.Image`
  width: 190px;
  height: 140px;
`;

const Explain = styled.Text`
  font-family: ${(props) => props.theme.fontFamily.SCDream5};
  color: ${(props) => props.theme.colors.darkyellow};
  font-size: 16px;
`;

const Login = () => {
  const bounceAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const bounce = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnimation, {
            toValue: -10, // Move up by 10px
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnimation, {
            toValue: 0, // Return to original position
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    bounce();
  }, [bounceAnimation]);

  return (
    <ScreenContainer>
      <Container>
        <LogoContainer>
          <Animated.View style={{transform: [{translateY: bounceAnimation}]}}>
            <Logo source={require('../assets/images/MOA_logo.png')} />
          </Animated.View>
          <Explain>소중한 순간, 쉽고 빠르게 나눠요</Explain>
        </LogoContainer>
        <LoginButton />
      </Container>
    </ScreenContainer>
  );
};

export default Login;
