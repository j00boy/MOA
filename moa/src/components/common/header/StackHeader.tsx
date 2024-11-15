import {TouchableOpacity} from 'react-native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../../types/screen';

const Container = styled.View`
  height: 70px;
  background-color: ${({theme}) => theme.colors.white};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0 8%;
  position: relative;
`;

const IconWrapper = styled.View`
  position: absolute;
  left: 8%;
`;

const Title = styled.Text`
  font-family: 'SCDream5';
  font-size: 20px;
  max-width: 80%;
`;

interface StackHeaderProps {
  title: string;
}

export default function StackHeader({title}: StackHeaderProps) {
  const navigation = useNavigation<AppNavigationProp>();
  const theme = useTheme();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeStack', {screen: 'Home'});
    }
  };

  return (
    <Container>
      <IconWrapper>
        <TouchableOpacity onPress={handleBackPress}>
          <Icon
            name="chevron-back"
            size={30}
            color={theme.colors.maindarkorange}
          />
        </TouchableOpacity>
      </IconWrapper>
      <Title numberOfLines={1}>{title}</Title>
    </Container>
  );
}
