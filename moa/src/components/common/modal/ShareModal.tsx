import {Alert, TouchableOpacity} from 'react-native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Clipboard from '@react-native-clipboard/clipboard';
import {onShare, kakaoShare} from '../../../utils/share';

const Container = styled.View`
  width: 170px;
  height: 50px;
  padding: 10px 15px;
  position: absolute;
  right: 0;
  top: 27px;
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

  const deepLink = isGroup ? `moa://group/${id}` : `moa://moment/${id}`;

  const message = isGroup
    ? `MOA의 ${name} 그룹에서 소중한 사진을 공유해보세요!`
    : `MOA의 ${name} 순간에서 소중한 사진을 공유해보세요!`;

  const handleCopyLink = () => {
    Clipboard.setString(deepLink);
    Alert.alert('', '공유 링크가 클립보드에 복사되었습니다.');
    toggleModal();
  };

  const handleKakaoShare = () => {
    kakaoShare(isGroup ? 'groupId' : 'momentId', id, message, deepLink);
  };

  const handleShareLink = () => {
    onShare(message, deepLink);
  };

  return (
    <Container>
      <LinkContainer onPress={handleCopyLink}>
        <Icon name="link" size={18} color={theme.colors.deepgray} />
      </LinkContainer>
      <TouchableOpacity onPress={handleKakaoShare}>
        <KaKaoLogo source={require('../../../assets/images/kakao-logo.png')} />
      </TouchableOpacity>
      <ShareContainer onPress={handleShareLink}>
        <Icon name="share" size={18} color={theme.colors.maindarkorange} />
      </ShareContainer>
    </Container>
  );
};

export default ShareModal;
