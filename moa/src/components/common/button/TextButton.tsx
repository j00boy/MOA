// src/components/common/button/IconButton.tsx
import React from 'react';
import {TouchableOpacityProps} from 'react-native';
import styled, {css, useTheme, DefaultTheme} from 'styled-components/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface TextButtonProps extends TouchableOpacityProps {
  iconName?: string;
  iconSet?: 'Material' | 'Feather';
  size?: 'small' | 'medium' | 'large';
  backcolor?: keyof DefaultTheme['colors'];
  onPress?: () => void;
  text: string;
  border?: boolean;
}

const StyledTextButton = styled.TouchableOpacity<{
  backcolor: keyof DefaultTheme['colors'];
  size: 'small' | 'medium' | 'large';
  bordercolor: string;
}>`
  background-color: ${({backcolor, theme}) => theme.colors[backcolor]};
  ${({size}) =>
    size === 'small' &&
    css`
      height: 30px;
      padding: 5px 10px;
    `}
  ${({size}) =>
    size === 'medium' &&
    css`
      padding: 5px 15px;
    `}
  ${({size}) =>
    size === 'large' &&
    css`
      height: 50px;
      width: 320px;
      padding: 5px 30px;
    `}
  border-radius: 15px;
  ${({bordercolor}) => bordercolor && `border: 1px solid ${bordercolor};`}
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

const ButtonText = styled.Text<{
  textcolor: string;
  size: 'small' | 'medium' | 'large';
}>`
  color: ${({textcolor}) => textcolor};
  font-size: ${({theme, size}) =>
    size === 'small'
      ? theme.fontSize.small
      : size === 'medium'
        ? theme.fontSize.regular
        : theme.fontSize.large};
  font-family: ${({theme, size}) =>
    size === 'small'
      ? theme.fontFamily.SCDream5
      : size === 'medium'
        ? theme.fontFamily.SCDream6
        : theme.fontFamily.SCDream7};
`;

export const TextButton: React.FC<TextButtonProps> = ({
  iconName,
  iconSet = 'Material',
  backcolor = 'white',
  size = 'medium',
  onPress,
  text,
  border = false,
  ...props
}) => {
  const theme = useTheme();
  const iconColor =
    backcolor === 'white' || backcolor === 'mainlightyellow'
      ? theme.colors.maindarkorange
      : theme.colors.white;
  const TextComponent = iconSet === 'Feather' ? FeatherIcon : MaterialIcon;
  const bordercolor = border ? theme.colors.maindarkorange : '';

  return (
    <StyledTextButton
      size={size}
      backcolor={backcolor}
      onPress={onPress}
      bordercolor={bordercolor}
      {...props}
    >
      {iconName && (
        <TextComponent name={iconName} size={15} color={iconColor} />
      )}
      <ButtonText textcolor={iconColor} size={size}>
        {text}
      </ButtonText>
    </StyledTextButton>
  );
};
