import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {Group} from '../../../types/group';
import GroupIconButton from '../../common/button/GroupIconButton';
import Icon from 'react-native-vector-icons/Ionicons';
import {Alert, TouchableOpacity} from 'react-native';
import {onShare, shareToKakaoUsingIntent} from '../../../utils/share';
import StyledModal from '../../common/modal/StyledModal';
import PinModal from '../../common/modal/PinModal';
import {AppHeaderNavigationProp} from '../../../types/screen';
import {useNavigation} from '@react-navigation/native';
import {sendFeedMessage, kakaoShare} from '../../../utils/kakaoshare';
import {useAuthStore} from '../../../stores/authStores';
import {Member} from '../../../types/moment';
import api from '../../../utils/api';

const Container = styled.View`
  width: 100%;
`;

const ContentBox = styled.View<{backcolor: string}>`
  width: 100%;
  background-color: ${({backcolor}) => backcolor};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 20px;
  padding: 20px;
`;

const Description = styled.Text<{color: string}>`
  color: ${({color}) => color};
  font-family: SCDream5;
  font-size: 16px;
  width: 80%;
`;

const IconContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 60px;
  justify-content: space-between;
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

const AlbumInfo = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  margin-top: 15px;
  padding: 0 15px;
`;

const LineContainer = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const DateText = styled.Text<{color: string}>`
  font-family: SCDream5;
  font-size: 15px;
  color: ${({color}) => color};
`;

const NormalText = styled.Text`
  font-family: SCDream4;
  font-size: 13px;
  margin: 0 5px;
`;

const PhotoNumText = styled(DateText)<{color: string}>`
  font-size: 16px;
  color: ${({color}) => color};
`;

interface GroupDetailHeaderProps {
  group: Group;
  owner: Member;
  lightColor: string;
  darkColor: string;
  onLoadingChange: (loading: boolean) => void;
}

const GroupDetailHeader = ({
  group,
  owner,
  lightColor,
  darkColor,
  onLoadingChange,
}: GroupDetailHeaderProps) => {
  const userId = useAuthStore((state: {userId: unknown}) => state.userId);

  const [isOptionModalVisible, setOptionModalVisible] = useState(false);
  const [isPinModalVisible, setPinModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<AppHeaderNavigationProp>();

  const toggleOptionModal = () => {
    setOptionModalVisible(!isOptionModalVisible);
  };

  const togglePinModal = () => {
    setPinModalVisible(!isPinModalVisible);
  };

  useEffect(() => {
    onLoadingChange(loading);
  }, [loading, onLoadingChange]);

  const options =
    owner.userId === userId
      ? [
          {id: 'pin', label: 'PIN번호 보기'},
          {id: 'put', label: '그룹 수정'},
          {id: 'delete', label: '그룹 삭제'},
        ]
      : [
          {id: 'pin', label: 'PIN번호 보기'},
          {id: 'exit', label: '그룹 나가기'},
        ];

  const handleDeleteGroup = async () => {
    setLoading(true);
    try {
      await api.delete(`/group/${group.groupId}`);
      Alert.alert(
        '그룹 삭제 완료',
        `${group.groupName} 그룹의 삭제가 완료되었습니다.`,
      );
      navigation.navigate('Home');
    } catch {
      Alert.alert('그룹 삭제 실패', '그룹 삭제 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExitGroup = async () => {
    setLoading(true);
    try {
      await api.delete(`/group/${group.groupId}/leave`);
      Alert.alert('그룹 나가기 완료', `${group.groupName} 그룹을 나갔습니다.`);
      navigation.navigate('Home');
    } catch {
      Alert.alert('그룹 나가기 실패', '그룹 탈퇴 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionId: string) => {
    toggleOptionModal();

    if (optionId === 'pin') {
      toggleOptionModal();
      togglePinModal();
    } else if (optionId === 'put') {
      toggleOptionModal();
      navigation.navigate('GroupAdd', {
        groupAddInfo: {
          groupId: group.groupId,
          groupName: group.groupName,
          groupDescription: group.groupDescription,
          groupColor: group.groupColor,
          groupIcon: group.groupIcon,
        },
        isEdit: true,
      });
    } else if (optionId === 'delete') {
      toggleOptionModal();
      handleDeleteGroup();
    } else if (optionId === 'exit') {
      toggleOptionModal();
      handleExitGroup();
    }
  };

  const handleShare = () => {
    // shareToKakaoUsingIntent(`moa://group/${group.groupId}`);
    // onShare(`${group.groupName} 그룹`, `moa://group/${group.groupId}`);

    // sendFeedMessage(`${group.groupName} 그룹`, `group/${group.groupId}`);
    kakaoShare();
  };

  return (
    <Container>
      <ContentBox backcolor={lightColor}>
        <Description color={darkColor}>{group.groupDescription}</Description>
        <IconContainer>
          <GroupIconButton
            color={group.groupColor}
            iconName={group.groupIcon}
          />
          <TouchableOpacity onPress={toggleOptionModal}>
            <Icon name="ellipsis-vertical" size={22} color={darkColor} />
          </TouchableOpacity>
        </IconContainer>
      </ContentBox>
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
        pinNum={group.groupPin}
        isModalVisible={isPinModalVisible}
        toggleModal={togglePinModal}
      />
      <AlbumInfo>
        <LineContainer>
          <DateText color={darkColor}>
            {group.createdAt.substring(0, 10)}
          </DateText>
          <NormalText>부터 모인 사진 총</NormalText>
          <PhotoNumText color={darkColor}>
            {group.groupTotalImages}장
          </PhotoNumText>
        </LineContainer>
        <TouchableOpacity onPress={handleShare}>
          <Icon name="share-social-sharp" size={25} color={darkColor} />
        </TouchableOpacity>
      </AlbumInfo>
    </Container>
  );
};

export default GroupDetailHeader;
