/* eslint-disable react-native/no-inline-styles */
import {Alert, TouchableOpacity} from 'react-native';
import React, {useEffect, useState} from 'react';
import {MomentInfoDetail} from '../../../types/moment';
import styled, {useTheme} from 'styled-components/native';
import Icon from 'react-native-vector-icons/Ionicons';
import StyledModal from '../../common/modal/StyledModal';
import PinModal from '../../common/modal/PinModal';
import {AppHeaderNavigationProp} from '../../../types/screen';
import {useNavigation} from '@react-navigation/native';
import {formatDate} from '../../../utils/common';
import {useAuthStore} from '../../../stores/authStores';
import api from '../../../utils/api';
import Timer from './Timer';
import ShareModal from '../../common/modal/ShareModal';

const Container = styled.View`
  width: 100%;
  border-radius: 20px;
  border: 1px solid ${({theme}) => theme.colors.maindarkorange};
  padding: 20px;
`;

const TitleLine = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const LeftTime = styled.Text`
  font-family: SCDream5;
  font-size: 15px;
  color: ${({theme}) => theme.colors.maindarkorange};
`;

const IconContainer = styled.View`
  flex-direction: row;
  width: 60px;
  justify-content: space-between;
  align-items: center;
`;

const ModalItemContainer = styled.TouchableOpacity`
  width: 100%;
  padding: 15px;
  align-items: center;
  justify-content: center;
`;

const ModalItem = styled.Text`
  font-family: SCDream4;
  font-size: 16px;
`;

const Description = styled.Text`
  width: 100%;
  font-family: 'SCDream5';
  font-size: 15px;
  margin: 20px 0;
`;

const TextLine = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TextName = styled.Text`
  font-family: 'SCDream4';
  font-size: 13px;
  color: ${({theme}) => theme.colors.deepgray};
  margin-right: 10px;
`;

const TextContent = styled.Text`
  font-family: 'SCDream5';
  font-size: 13px;
  color: ${({theme}) => theme.colors.mainlightorange};
`;

interface MomentDetailHeaderProps {
  momentInfoDetail: MomentInfoDetail;
  onLoadingChange: (loading: boolean) => void;
}

const MomentDetailHeader = ({
  momentInfoDetail,
  onLoadingChange,
}: MomentDetailHeaderProps) => {
  const userId = useAuthStore((state: {userId: unknown}) => state.userId);
  const [isOptionModalVisible, setOptionModalVisible] = useState(false);
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<AppHeaderNavigationProp>();

  const toggleOptionModal = () => {
    setOptionModalVisible(!isOptionModalVisible);
  };

  const togglePinModal = () => {
    setPinModalVisible(!isPinModalVisible);
  };

  const toggleShareModal = () => {
    setShareModalVisible(!isShareModalVisible);
  };

  useEffect(() => {
    onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  const options =
    momentInfoDetail.momentOwner.userId === userId
      ? [
          {id: 'pin', label: 'PIN번호 보기'},
          {id: 'patch', label: '순간 수정'},
          {id: 'delete', label: '순간 삭제'},
        ]
      : [
          {id: 'pin', label: 'PIN번호 보기'},
          {id: 'exit', label: '순간 나가기'},
        ];

  const handleDeleteMoment = async () => {
    setLoading(true);
    try {
      await api.delete(`/moment/${momentInfoDetail.id}`);
      Alert.alert(
        '',
        `${momentInfoDetail.momentName} 순간의 삭제가 완료되었습니다.`,
      );
      navigation.navigate('Home');
    } catch {
      Alert.alert('', '순간 삭제 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExitMoment = async () => {
    setLoading(true);
    try {
      await api.put(`/moment/${momentInfoDetail.id}`);
      Alert.alert('', `${momentInfoDetail.momentName} 순간을 나갔습니다.`);
      navigation.navigate('Home');
    } catch {
      Alert.alert('', '순간 탈퇴 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    toggleOptionModal();

    if (optionId === 'pin') {
      toggleOptionModal();
      togglePinModal();
    } else if (optionId === 'patch') {
      toggleOptionModal();
      navigation.navigate('MomentAdd', {
        momentAddInfo: {
          momentId: momentInfoDetail.id,
          momentName: momentInfoDetail.momentName,
          momentDescription: momentInfoDetail.momentDescription,
          uploadOption: momentInfoDetail.uploadOption,
        },
        isEdit: true,
      });
    } else if (optionId === 'delete') {
      toggleOptionModal();
      handleDeleteMoment();
    } else if (optionId === 'exit') {
      toggleOptionModal();
      handleExitMoment();
    }
  };

  const theme = useTheme();

  return (
    <Container>
      <TitleLine>
        {/* <LeftTime>남은 시간 타이머</LeftTime> */}
        <Timer createdAt={momentInfoDetail.createdAt} />
        <IconContainer>
          <TouchableOpacity
            onPress={toggleShareModal}
            style={{position: 'relative'}}
          >
            <Icon
              name="share-social-sharp"
              size={22}
              color={theme.colors.maindarkorange}
            />
            <ShareModal
              isGroup={false}
              id={momentInfoDetail.id}
              name={momentInfoDetail.momentName}
              visible={isShareModalVisible}
              toggleModal={toggleShareModal}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleOptionModal}>
            <Icon
              name="ellipsis-vertical"
              size={22}
              color={theme.colors.maindarkorange}
            />
          </TouchableOpacity>
        </IconContainer>
      </TitleLine>
      <Description>{momentInfoDetail.momentDescription}</Description>
      <TextLine>
        <TextName>생성일</TextName>
        <TextContent>{formatDate(momentInfoDetail.createdAt)}</TextContent>
      </TextLine>
      <TextLine>
        <TextName>생성자</TextName>
        <TextContent>{momentInfoDetail.momentOwner.nickname}</TextContent>
      </TextLine>
      <StyledModal
        isModalVisible={isOptionModalVisible}
        toggleModal={toggleOptionModal}
      >
        {options.map((option) => (
          <ModalItemContainer
            key={option.id}
            onPress={() => handleSelectOption(option.id)}
          >
            <ModalItem>{option.label}</ModalItem>
          </ModalItemContainer>
        ))}
      </StyledModal>
      <PinModal
        pinNum={momentInfoDetail.momentPin}
        isModalVisible={isPinModalVisible}
        toggleModal={togglePinModal}
      />
    </Container>
  );
};

export default MomentDetailHeader;
