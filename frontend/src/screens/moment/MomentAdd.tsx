/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect, useState} from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import AddInputBox from '../../components/common/input/AddInputBox';
import {Picker} from '@react-native-picker/picker';
import styled from 'styled-components/native';
import {TextButton} from '../../components/common/button/TextButton';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {Alert} from 'react-native';
import {AppHeaderParamList, HomeScreenNavigationProp} from '../../types/screen';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import StackHeader from '../../components/common/header/StackHeader';

const PickerContainer = styled.View`
  width: 100%;
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}) => theme.colors.maindarkorange};
`;

const StyledPicker = styled(Picker)`
  width: 100%;
  background-color: ${({theme}) => theme.colors.white};
  font-family: SCDream4;
  font-size: 18px;
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}) => theme.colors.maindarkorange};
`;

const ButtonContainer = styled.View`
  width: 100%;
  margin-top: 20px;
  display: flex;
  align-items: center;
`;

type MomentAddRouteProp = RouteProp<AppHeaderParamList, 'MomentAdd'>;

const MomentAdd = () => {
  const [loading, setLoading] = useState(false);
  const [momentName, setMomentName] = useState('');
  const [momentDescription, setMomentDescription] = useState('');
  const [uploadOption, setUploadOption] = useState('only');

  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<MomentAddRouteProp>();

  const {isEdit, momentAddInfo} = route.params || {
    isEdit: false,
    momentAddInfo: {
      momentId: '',
      momentName: '',
      momentDescription: '',
      uploadOption: '',
    },
  };

  useEffect(() => {
    if (isEdit && momentAddInfo) {
      navigation.setOptions({
        header: () => <StackHeader title="순간 수정" />,
      });
      setMomentName(momentAddInfo.momentName);
      setMomentDescription(momentAddInfo.momentDescription);
      setUploadOption(momentAddInfo.uploadOption);
    } else {
      navigation.setOptions({
        header: () => <StackHeader title="순간 생성" />,
      });
    }
  }, [isEdit, momentAddInfo, navigation]);

  const handleMomentPost = async () => {
    if (momentName === '' || momentDescription === '') {
      Alert.alert('', '모든 정보를 정확히 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        const newMoment = {
          momentName: momentName,
          momentDescription: momentDescription,
        };
        const response = await api.patch(
          `/moment/${momentAddInfo.momentId}`,
          newMoment,
        );
        Alert.alert('', `${momentName} 순간 수정이 완료되었습니다.`);
        navigation.navigate('MomentDetail', {
          momentId: response.data?.momentId,
        });
      } else {
        const newMoment = {
          momentName: momentName,
          momentDescription: momentDescription,
          uploadOption: uploadOption,
        };
        const response = await api.post('/moment', newMoment);
        Alert.alert('', `${momentName} 순간이 생성되었습니다.`);
        navigation.navigate('MomentDetail', {
          momentId: response.data?.momentId,
        });
      }
    } catch (error) {
      Alert.alert(
        `순간 ${isEdit ? '수정' : '생성'} 오류`,
        `순간 ${isEdit ? '수정' : '생성'} 도중 오류가 발생했습니다.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <AddInputBox
        label="순간 이름"
        value={momentName}
        onChangeText={(text) => setMomentName(text)}
      />
      <AddInputBox
        label="순간 설명"
        value={momentDescription}
        onChangeText={(text) => setMomentDescription(text)}
      />
      <AddInputBox label="멤버 권한 설정" isText={false}>
        <PickerContainer>
          <StyledPicker
            selectedValue={uploadOption}
            onValueChange={(itemValue) => setUploadOption(itemValue as string)}
            enabled={!isEdit}
          >
            <Picker.Item label="나의 업로드만 허용" value="only" />
            <Picker.Item label="모든 멤버의 업로드 허용" value="all" />
          </StyledPicker>
        </PickerContainer>
      </AddInputBox>
      <ButtonContainer>
        <TextButton
          text={isEdit ? '순간 수정하기' : '순간 만들기'}
          size="large"
          backcolor="maindarkorange"
          onPress={handleMomentPost}
        />
      </ButtonContainer>
      {loading && <LoadingSpinner />}
    </ScreenContainer>
  );
};

export default MomentAdd;
