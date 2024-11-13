/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {Modal, Text} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {
  launchCamera,
  launchImageLibrary,
  MediaType,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {TextButton} from '../common/button/TextButton';
import {useUserStore} from '../../stores/userStores';

const Container = styled.View`
  width: 100%;
`;

const Title = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 5px;
`;

const ModalBackground = styled.TouchableOpacity`
  flex: 1;
  justify-content: flex-end;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContainer = styled.View`
  background-color: white;
  padding: 20px;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
`;

const OptionButton = styled.TouchableOpacity`
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #ddd;
`;

const OptionText = styled.Text`
  font-size: 18px;
  font-family: ${(props) => props.theme.fontFamily.SCDream4};
`;

const CancelButton = styled.TouchableOpacity`
  padding: 15px;
  align-items: center;
`;

const CancelText = styled.Text`
  font-size: 20px;
  font-family: ${(props) => props.theme.fontFamily.SCDream4};
  color: ${(props) => props.theme.colors.maindarkorange};
`;

const PreviewContainer = styled.View`
  margin-top: 20px;
  align-items: center;
  width: 100%;
`;

const PlaceholderPreview = styled.View`
  width: 100%;
  height: 300px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.colors.lightgray};
  background-color: #e0e0e0;
  justify-content: center;
  align-items: center;
`;

const PlaceholderText = styled.Text`
  color: ${(props) => props.theme.colors.gray};
  font-size: 16px;
  font-family: ${(props) => props.theme.fontFamily.SCDream4};
`;

const PreviewImage = styled.Image`
  width: 100%;
  height: 300px;
  border-radius: 10px;
  border: 1px solid ${(props) => props.theme.colors.lightgray};
`;

const MyComponent = () => {
  const {user, fetchUser, updateUser} = useUserStore();
  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  // const [imageUri, setImageUri] = useState<string | null>(
  //   user?.faceEmbedding || '',
  // );
  const [faceEmbedding, setfaceEmbedding] = useState<string | null>(
    user?.faceEmbedding || '',
  );
  const theme = useTheme();

  // 컴포넌트가 처음 렌더링될 때 사용자 데이터를 불러와 imageUri 설정
  // useEffect(() => {
  //   const loadUserData = async () => {
  //     await fetchUser(); // 사용자 데이터를 불러옴
  //     if (user?.faceEmbedding) {
  //       setfaceEmbedding(user.faceEmbedding); // faceEmbedding 값으로 imageUri 설정
  //     }
  //   };
  //   loadUserData();
  // }, []);
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      setfaceEmbedding(user?.faceEmbedding || '');
      console.log('처음에는', faceEmbedding);
    }
  }, [user]);

  const handleSelectOption = async (option: string) => {
    // 클릭시 modaVisible상태가 false로 변경됨
    setModalVisible(false);
    let selectedUri = '';
    // const pickerOptions = {mediaType: 'photo' as MediaType};
    if (option === 'camera') {
      // launchCamera(pickerOptions, (response: ImagePickerResponse) => {
      //   handleImageResponse(response);
      //   console.log('찍은 사진: ', response);
      // });
      const result = await launchCamera({
        mediaType: 'photo',
      });
      if (result.assets && result.assets[0].uri) {
        // setfaceEmbedding(result.assets[0].uri);
        // console.log('사진 찍은거 ', faceEmbedding);
        selectedUri = result.assets[0].uri;
        console.log('사진 uri ', selectedUri);
      }
    } else if (option === 'gallery') {
      // launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
      //   handleImageResponse(response);
      // });
      const result = await launchImageLibrary({
        mediaType: 'photo',
      });
      if (result.assets && result.assets[0].uri) {
        // setfaceEmbedding(result.assets[0].uri);
        // console.log('갤러리 사진 ', faceEmbedding);
        selectedUri = result.assets[0].uri;
        console.log('사진 uri ', selectedUri);
      }
    }
    // console.log('엥 어디감?', faceEmbedding);
    // await updateUser({faceEmbedding});
    // await fetchUser();
    if (selectedUri) {
      await setfaceEmbedding(selectedUri); // 로컬 상태 업데이트 (미리보기용)
      console.log('선택된 이미지 URI:', selectedUri);
      console.log('사진 주소등록됐냐?', faceEmbedding);

      // 바로 updateUser 함수에 선택된 URI 전달
      // await updateUser({faceEmbedding});
      await updateUser({
        userName: user?.userName || '',
        faceEmbedding: selectedUri,
      });
      await fetchUser(); // 업데이트 후 사용자 정보 새로고침
    }
  };

  // const handleImageResponse = async (response: ImagePickerResponse) => {
  //   if (response.didCancel) {
  //     console.log('사용자가 취소했습니다.');
  //   } else if (response.errorMessage) {
  //     console.error('이미지 선택 오류:', response.errorMessage);
  //   } else if (response.assets && response.assets[0].uri) {
  //     const uri = response.assets[0].uri;
  //     setfaceEmbedding(uri);
  //     console.log(faceEmbedding);
  //     // await uploadImage(uri); // 이미지 선택 후 바로 업로드
  //     await updateUser({faceEmbedding});
  //     await fetchUser();
  //   }
  // };

  // const uploadImage = async (uri: string) => {
  //   // const updatedData = {faceEmbedding: uri};

  //   try {
  //     await updateUser({imageUri}); // updateUser에 URI 문자열 전송
  //     console.log('이미지 URI 업로드 성공');
  //     await fetchUser(); // 사용자 정보 새로고침
  //   } catch (error) {
  //     console.error('이미지 업로드 실패:', error);
  //   }
  // };

  return (
    <Container>
      <Title>
        <Text style={{fontSize: 18, fontFamily: theme.fontFamily.SCDream6}}>
          얼굴 등록
        </Text>
        <TextButton
          backcolor="mainlightyellow"
          text="등록하기"
          iconName="photo-camera"
          iconSet="Material"
          size="small"
          onPress={() => setModalVisible(true)}
        />
      </Title>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ModalBackground
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <ModalContainer>
            <OptionButton onPress={() => handleSelectOption('camera')}>
              <OptionText>사진 촬영</OptionText>
            </OptionButton>
            <OptionButton onPress={() => handleSelectOption('gallery')}>
              <OptionText>갤러리에서 선택</OptionText>
            </OptionButton>
            <CancelButton onPress={() => setModalVisible(false)}>
              <CancelText>취소</CancelText>
            </CancelButton>
          </ModalContainer>
        </ModalBackground>
      </Modal>

      <PreviewContainer>
        {faceEmbedding ? (
          <PreviewImage source={{uri: faceEmbedding}} />
        ) : (
          <PlaceholderPreview>
            <PlaceholderText>미리보기가 여기에 표시됩니다</PlaceholderText>
          </PlaceholderPreview>
        )}
      </PreviewContainer>
    </Container>
  );
};

export default MyComponent;
