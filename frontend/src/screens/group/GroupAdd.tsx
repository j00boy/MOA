/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState} from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import AddInputBox from '../../components/common/input/AddInputBox';
import styled from 'styled-components/native';
import GroupIconButton from '../../components/common/button/GroupIconButton';
import {lightColorMap, darkColorMap} from '../../utils/groupColor';
import {TextButton} from '../../components/common/button/TextButton';
import {AppHeaderParamList, HomeScreenNavigationProp} from '../../types/screen';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import StackHeader from '../../components/common/header/StackHeader';
import {Alert} from 'react-native';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const InputContent = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ColorButton = styled.TouchableOpacity<{
  groupColor: string;
  bgColor: string;
  isSelected: boolean;
}>`
  width: 30px;
  height: 30px;
  border-radius: 50px;
  background-color: ${({bgColor}) => bgColor};
  border: 2px solid;
  border-color: ${({isSelected, theme, groupColor}) =>
    isSelected ? darkColorMap[groupColor] : theme.colors.white};
`;

const IconButtonContainer = styled.TouchableOpacity<{
  isSelected: boolean;
}>`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50px;
  border: 4px solid
    ${({theme, isSelected}) =>
      isSelected ? theme.colors.white : 'transparent'};
`;

const ButtonContainer = styled.View`
  width: 100%;
  margin-top: 20px;
  display: flex;
  align-items: center;
`;

type GroupAddRouteProp = RouteProp<AppHeaderParamList, 'GroupAdd'>;

const GroupAdd = () => {
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupColor, setGroupColor] = useState('gray');
  const [groupIcon, setGroupIcon] = useState('');

  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<GroupAddRouteProp>();

  const {isEdit, groupAddInfo} = route.params || {
    isEdit: false,
    groupAddInfo: {
      groupId: '',
      groupName: '',
      groupDescription: '',
      groupColor: '',
      groupIcon: '',
    },
  };

  const iconNameList = [
    'heart',
    'chat',
    'home',
    'book-open',
    'briefcase',
    'graduation-cap',
  ];

  useEffect(() => {
    if (isEdit && groupAddInfo) {
      navigation.setOptions({
        header: () => <StackHeader title="그룹 수정" />,
      });
      setGroupName(groupAddInfo.groupName);
      setGroupDescription(groupAddInfo.groupDescription);
      setGroupColor(groupAddInfo.groupColor);
      setGroupIcon(groupAddInfo.groupIcon);
    } else {
      navigation.setOptions({
        header: () => <StackHeader title="그룹 생성" />,
      });
    }
  }, [isEdit, groupAddInfo, navigation]);

  const handleGroupPost = async () => {
    if (
      groupName === '' ||
      groupDescription === '' ||
      groupColor === 'gray' ||
      groupIcon === ''
    ) {
      Alert.alert('', '모든 정보를 정확히 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const newGroup = {
        groupName: groupName,
        groupDescription: groupDescription,
        color: groupColor,
        icon: groupIcon,
      };

      if (isEdit) {
        const response = await api.put(
          `/group/${groupAddInfo.groupId}`,
          newGroup,
        );
        Alert.alert('', `${groupName} 그룹 수정이 완료되었습니다.`);
        navigation.navigate('GroupDetail', {
          groupId: response.data?.groupId,
        });
      } else {
        const response = await api.post(`/group`, newGroup);
        Alert.alert('', `${groupName} 그룹 생성이 완료되었습니다.`);
        navigation.navigate('GroupDetail', {
          groupId: response.data?.groupId,
        });
      }
    } catch (error) {
      console.log(error);
      Alert.alert('', '그룹 생성 도중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AddInputBox
        label="그룹 이름"
        value={groupName}
        onChangeText={(text) => setGroupName(text)}
      />
      <AddInputBox
        label="그룹 설명"
        value={groupDescription}
        onChangeText={(text) => setGroupDescription(text)}
      />
      <AddInputBox label="색상 선택" isText={false}>
        <InputContent>
          {Object.entries(lightColorMap).map(([colorName, colorValue]) => (
            <ColorButton
              key={colorName}
              groupColor={colorName}
              bgColor={colorValue}
              isSelected={groupColor === colorName}
              onPress={() => setGroupColor(colorName)}
            />
          ))}
        </InputContent>
      </AddInputBox>
      <AddInputBox label="아이콘 선택" isText={false}>
        <InputContent>
          {iconNameList.map((iconName) => (
            <IconButtonContainer
              key={iconName}
              isSelected={groupIcon === iconName}
              onPress={() => setGroupIcon(iconName)}
            >
              <GroupIconButton
                color={groupColor}
                iconName={iconName}
                isAddPage={true}
                isSelected={iconName === groupIcon}
              />
            </IconButtonContainer>
          ))}
        </InputContent>
      </AddInputBox>
      <ButtonContainer>
        <TextButton
          text={isEdit ? '그룹 수정하기' : '그룹 만들기'}
          size="large"
          backcolor="maindarkorange"
          onPress={handleGroupPost}
        />
      </ButtonContainer>
      {loading && <LoadingSpinner />}
    </ScreenContainer>
  );
};

export default GroupAdd;
