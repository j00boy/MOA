import React, {useState} from 'react';
import styled from 'styled-components/native';
import {GroupInfoDetail} from '../../../types/group';
import GroupIconButton from '../../common/button/GroupIconButton';
import Icon from 'react-native-vector-icons/Ionicons';
import {TouchableOpacity} from 'react-native';
import {onShare} from '../../../utils/share';
import StyledModal from '../../common/modal/StyledModal';
import PinModal from '../../common/modal/PinModal';
import {HomeStackParamList} from '../../../types/screen';
import {RouteProp, useRoute} from '@react-navigation/native';
import {sendFeedMessage} from '../../../utils/kakaoshare';

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

type GroupDetailRouteProp = RouteProp<HomeStackParamList, 'GroupDetail'>;

interface GroupDetailHeaderProps {
  groupInfoDetail: GroupInfoDetail;
  lightColor: string;
  darkColor: string;
}

const GroupDetailHeader = ({
  groupInfoDetail,
  lightColor,
  darkColor,
}: GroupDetailHeaderProps) => {
  const route = useRoute<GroupDetailRouteProp>();
  const groupId = route.params.groupId;

  const [isOptionModalVisible, setOptionModalVisible] = useState(false);
  const [isPinModalVisible, setPinModalVisible] = useState(false);

  const toggleOptionModal = () => {
    setOptionModalVisible(!isOptionModalVisible);
  };

  const togglePinModal = () => {
    setPinModalVisible(!isPinModalVisible);
  };

  const options = [
    {id: 'pin', label: 'PIN번호 보기'},
    {id: 'put', label: '그룹 수정'},
    {id: 'delete', label: '그룹 삭제'},
  ];

  const handleSelectOption = (optionId: string) => {
    toggleOptionModal();

    if (optionId === 'pin') {
      toggleOptionModal();
      togglePinModal();
    } else if (optionId === 'put') {
      toggleOptionModal();
    } else if (optionId === 'delete') {
      toggleOptionModal();
    }
  };

  // 임시 핀번호 -> 나중에 변경 예정
  const pinNum = '123456';

  return (
    <Container>
      <ContentBox backcolor={lightColor}>
        <Description color={darkColor}>
          {groupInfoDetail.groupDescription}
        </Description>
        <IconContainer>
          <GroupIconButton
            color={groupInfoDetail.groupColor}
            iconName={groupInfoDetail.groupIcon}
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
        pinNum={pinNum}
        isModalVisible={isPinModalVisible}
        toggleModal={togglePinModal}
      />
      <AlbumInfo>
        <LineContainer>
          <DateText color={darkColor}>2024-06-20</DateText>
          <NormalText>부터 모인 사진 총</NormalText>
          <PhotoNumText color={darkColor}>777장</PhotoNumText>
        </LineContainer>
        {/* <TouchableOpacity
          onPress={() =>
            onShare(
              `${groupInfoDetail.groupName} 그룹`,
              `moa://group/${groupId}`,
            )
          }
        > */}
        <TouchableOpacity
          onPress={() =>
            sendFeedMessage(
              `${groupInfoDetail.groupName} 그룹`,
              `group/${groupId}`,
            )
          }
        >
          <Icon name="share-social-sharp" size={25} color={darkColor} />
        </TouchableOpacity>
      </AlbumInfo>
    </Container>
  );
};

export default GroupDetailHeader;
