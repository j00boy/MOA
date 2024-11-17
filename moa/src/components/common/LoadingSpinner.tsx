import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {ActivityIndicator} from 'react-native';

const LoadingOverlay = styled.View<{isDark: boolean; isScreen: boolean}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: ${({isScreen}) => (isScreen ? '80px' : '0')};
  justify-content: center;
  align-items: center;
  ${({isDark}) =>
    isDark
      ? 'background-color: rgba(0, 0, 0, 0.5);'
      : 'background-color: white'}
`;

interface LoadingSpinnerProps {
  isDark?: boolean;
  isScreen?: boolean;
}

const LoadingSpinner = ({
  isDark = true,
  isScreen = true,
}: LoadingSpinnerProps) => {
  const theme = useTheme();

  return (
    <LoadingOverlay isDark={isDark} isScreen={isScreen}>
      <ActivityIndicator size="large" color={theme.colors.maindarkorange} />
    </LoadingOverlay>
  );
};

export default LoadingSpinner;
