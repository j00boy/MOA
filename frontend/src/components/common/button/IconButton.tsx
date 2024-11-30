// src/components/common/button/IconButton.tsx
import React from 'react';
import {TouchableOpacityProps} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface IconButtonProps extends TouchableOpacityProps {
  iconName: string;
  iconSet?: 'Material' | 'Feather';
  backcolor?: 'white' | 'maindarkorange';
  onPress?: () => void;
}

const StyledIconButton = styled.TouchableOpacity<{backcolor: string}>`
  background-color: ${({backcolor, theme}) =>
    backcolor === 'maindarkorange'
      ? theme.colors.maindarkorange
      : theme.colors.white};
  border-radius: 50px;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
`;

const ButtonIcon = styled.View`
  align-items: center;
  justify-content: center;
`;

export const IconButton: React.FC<IconButtonProps> = ({
  iconName,
  iconSet = 'Material',
  backcolor = 'white',
  onPress,
  ...props
}) => {
  const theme = useTheme();
  const IconComponent = iconSet === 'Feather' ? FeatherIcon : MaterialIcon;
  return (
    <StyledIconButton backcolor={backcolor} onPress={onPress} {...props}>
      <ButtonIcon>
        <IconComponent
          name={iconName}
          size={16}
          color={backcolor === 'white' ? theme.colors.maindarkorange : 'white'}
        />
      </ButtonIcon>
    </StyledIconButton>
  );
};
