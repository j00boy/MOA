/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FAIcon from 'react-native-vector-icons/FontAwesome6';
import {darkColorMap, lightColorMap} from '../../../utils/groupColor';

const Container = styled.View<{bgColor: string}>`
  width: 30px;
  height: 30px;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({bgColor}) => bgColor};
`;

interface GroupIconButtonProps {
  color: string;
  iconName: string;
  isAddPage?: boolean;
  isSelected?: boolean;
}

const GroupIconButton = ({
  color,
  iconName,
  isAddPage = false,
  isSelected = false,
}: GroupIconButtonProps) => {
  const theme = useTheme();

  let iconColor = theme.colors.white;
  let backgroundColor = darkColorMap[color];

  if (isAddPage) {
    if (color === 'gray') {
      iconColor = isSelected ? theme.colors.mediumgray : theme.colors.deepgray;
      backgroundColor = isSelected
        ? theme.colors.deepgray
        : theme.colors.mediumgray;
    } else {
      iconColor = isSelected ? lightColorMap[color] : darkColorMap[color];
      backgroundColor = isSelected ? darkColorMap[color] : lightColorMap[color];
    }
  }

  const renderIcon = () => {
    if (
      iconName === 'chat' ||
      iconName === 'briefcase' ||
      iconName === 'home'
    ) {
      return <EntypoIcon name={iconName} size={17} color={iconColor} />;
    } else if (iconName === 'heart') {
      return (
        <EntypoIcon
          name={iconName}
          size={19}
          color={iconColor}
          style={{marginTop: 1}}
        />
      );
    } else if (iconName === 'book-open' || iconName === 'graduation-cap') {
      return <FAIcon name={iconName} size={15} color={iconColor} />;
    }
    return null;
  };

  return <Container bgColor={backgroundColor}>{renderIcon()}</Container>;
};

export default GroupIconButton;
