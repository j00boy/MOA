import React, {useRef, useState} from 'react';
import StyledModal from './StyledModal';
import styled from 'styled-components/native';
import {
  Alert,
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
} from 'react-native';
import {TextButton} from '../button/TextButton';
import api from '../../../utils/api';
import {AppNavigationProp} from '../../../types/screen';
import {useNavigation} from '@react-navigation/native';

const ContentContainer = styled.View`
  padding: 30px;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 3;
`;

const Title = styled.Text`
  font-family: 'SCDream5';
  font-size: 18px;
  color: ${({theme}) => theme.colors.maindarkorange};
  margin-bottom: 30px;
`;

const PinContainer = styled.View`
  width: 90%;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 30px;
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

const PinInput = styled(TextInput)`
  font-family: SCDream4;
  font-size: 15px;
  text-align: center;
  width: 30px;
  height: 50px;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 110px;
`;

interface PinModalProps {
  isGroup?: boolean;
  id: string;
  isModalVisible: boolean;
  toggleModal: () => void;
  onSuccess: () => void;
}

const PinPostModal = ({
  isGroup = false,
  id,
  isModalVisible,
  toggleModal,
  onSuccess,
}: PinModalProps) => {
  const [pinNum, setPinNum] = useState<string>('');
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    if (text.length > 1) {
      // 붙여넣기 처리
      const newPin = text.slice(0, 6).split('');
      setPinNum(newPin.join(''));
      newPin.forEach((char, i) => {
        inputRefs.current[i]?.setNativeProps({text: char});
      });
      inputRefs.current[5]?.focus();
    } else {
      // 개별 입력 처리
      const newPin = pinNum.split('');
      newPin[index] = text;
      setPinNum(newPin.join(''));

      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus(); // 다음 input으로 이동
      }
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key === 'Backspace' && index > 0 && !pinNum[index]) {
      inputRefs.current[index - 1]?.focus(); // 이전 input으로 이동
    }
  };

  const handleGoback = () => {
    toggleModal();
    navigation.navigate('HomeStack', {screen: 'Home', params: undefined});
  };

  const handleSubmitPin = async () => {
    try {
      if (isGroup) {
        await api.post(`/group/${id}/join?PIN=${pinNum}`);
      } else {
        await api.post(`/moment/${id}?PIN=${pinNum}`);
      }
      toggleModal();
      onSuccess();
    } catch (error) {
      Alert.alert('', 'PIN번호가 일치하지 않습니다.');
    }
  };

  const navigation = useNavigation<AppNavigationProp>();

  return (
    <StyledModal
      isModalVisible={isModalVisible}
      toggleModal={toggleModal}
      canClickOverlay={false}
    >
      <ContentContainer>
        <Title>PIN 번호 입력</Title>
        <PinContainer>
          {Array.from({length: 6}).map((_, index) => (
            <NumberContainer key={index}>
              <PinInput
                ref={(ref) => (inputRefs.current[index] = ref)}
                maxLength={1}
                autoCapitalize="none"
                value={pinNum[index] || ''}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            </NumberContainer>
          ))}
        </PinContainer>
        <ButtonContainer>
          <TextButton
            text="이전"
            size="small"
            onPress={() => handleGoback()}
            border={true}
          />
          <TextButton
            text="입장"
            size="small"
            backcolor="maindarkorange"
            onPress={handleSubmitPin}
          />
        </ButtonContainer>
      </ContentContainer>
    </StyledModal>
  );
};

export default PinPostModal;
