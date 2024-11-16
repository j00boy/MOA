import {TouchableOpacity} from 'react-native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const Container = styled.View`
  width: 170px;
  height: 50px;
  padding: 10px 15px;
  position: absolute;
  right: 0;
  top: 27;
  background-color: ${({theme}) => theme.colors.white};
  border: solid 1px ${({theme}) => theme.colors.mediumgray};
  border-radius: 10px;
  z-index: 9;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const LinkContainer = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  background-color: ${({theme}) => theme.colors.mediumgray};
  border-radius: 50px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const KaKaoLogo = styled.Image`
  width: 30px;
  height: 30px;
`;

const ShareContainer = styled(LinkContainer)`
  background-color: ${({theme}) => theme.colors.white};
  border: solid 1px ${({theme}) => theme.colors.mediumgray};
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
        <Icon name="link" size={18} color={theme.colors.deepgray} />
      </LinkContainer>
      <TouchableOpacity>
        <KaKaoLogo source={require('../../../assets/images/kakao-logo.png')} />
      </TouchableOpacity>
      <ShareContainer>
        <Icon name="share" size={18} color={theme.colors.maindarkorange} />
      </ShareContainer>
    </Container>
  );
};

export default ShareModal;
