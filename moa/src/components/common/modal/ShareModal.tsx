import {TouchableOpacity} from 'react-native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import Icon from 'react-native-vector-icons/Entypo';

const Container = styled.View`
  width: 170px;
  height: 50px;
  padding: 10px 15px;
  position: absolute;
  right: 0;
  background-color: ${({theme}) => theme.colors.white};
  elevation: 3;
  border-radius: 10px;
  z-index: 9;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LinkContainer = styled.TouchableOpacity`
  width: 30px;
  height: 30px;
  background-color: ${({theme}) => theme.colors.mediumgray};
  border-radius: 50px;
`;

const KaKaoLogo = styled.Image`
  width: 32px;
  height: 30px;
`;

interface ShareModalProps {
  isGroup?: boolean;
  id: string;
  name: string;
  visible: boolean;
  toggleModal: () => void;
}

const ShareModal = ({
  isGroup = false,
  id,
  name,
  visible,
  toggleModal,
}: ShareModalProps) => {
  const theme = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Container>
      <LinkContainer>
        <Icon name="link" size={20} color={theme.colors.deepgray} />
      </LinkContainer>
      <TouchableOpacity>
        <KaKaoLogo source={require('../../../assets/images/kakao-logo.png')} />
      </TouchableOpacity>
    </Container>
  );
};

export default ShareModal;
