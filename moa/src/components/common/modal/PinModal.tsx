import React from 'react';
import StyledModal from './StyledModal';
import styled, {useTheme} from 'styled-components/native';
import Icon from 'react-native-vector-icons/Octicons';
import Clipboard from '@react-native-clipboard/clipboard';
import {Alert} from 'react-native';

const ContentContainer = styled.View`
  padding: 30px;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const Title = styled.Text`
  font-family: 'SCDream5';
  font-size: 20px;
  color: ${({theme}) => theme.colors.maindarkorange};
  margin-bottom: 30px;
`;

const IconContainer = styled.TouchableOpacity`
  position: absolute;
  top: 30px;
  right: 30px;
`;

const PinContainer = styled.View`
  width: 90%;
  flex-direction: row;
  justify-content: space-between;
`;

const NumberContainer = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background-color: ${({theme}) => theme.colors.mainlightyellow};
  align-items: center;
  justify-content: center;
  margin: 0 5px;
`;

const Pin = styled.Text`
  font-family: SCDream4;
  font-size: 18px;
`;

interface PinModalProps {
  isPost?: boolean;
  pinNum: string;
  isModalVisible: boolean;
  toggleModal: () => void;
}

const PinModal = ({pinNum, isModalVisible, toggleModal}: PinModalProps) => {
  const theme = useTheme();

  const copyToClipboard = () => {
    Clipboard.setString(pinNum);
    Alert.alert('클립보드에 복사되었습니다.');
    toggleModal();
  };

  return (
    <StyledModal isModalVisible={isModalVisible} toggleModal={toggleModal}>
      <ContentContainer>
        <Title>PIN 번호</Title>
        <IconContainer onPress={copyToClipboard}>
          <Icon name="copy" size={20} color={theme.colors.maindarkorange} />
        </IconContainer>
        <PinContainer>
          {pinNum.split('').map((digit, index) => (
            <NumberContainer key={index}>
              <Pin>{digit}</Pin>
            </NumberContainer>
          ))}
        </PinContainer>
      </ContentContainer>
    </StyledModal>
  );
};

export default PinModal;
