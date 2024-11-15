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
  const {user, fetchUser, uploadFace} = useUserStore();
  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [registerImage, setregisterImage] = useState('');
  const [imageFileUrl, setImageFileUrl] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

  // const [faceEmbedding, setfaceEmbedding] = useState<string | null>(
  //   user?.faceEmbedding || '',
  // );
  const theme = useTheme();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setregisterImage(user?.registerImage || '');
      console.log('처음에는', registerImage);
    }
  }, [user]);

  const handleSelectOption = async (option: string) => {
    // 클릭시 modaVisible상태가 false로 변경됨
    setModalVisible(false);
    let selectedImage = null;

    if (option === 'camera') {
      const result = await launchCamera({
        mediaType: 'photo',
      });
      if (result.assets && result.assets[0].uri) {
        selectedImage = result.assets[0];
        console.log('사진 uri ', selectedImage);
      }
    } else if (option === 'gallery') {
      const result = await launchImageLibrary({
        mediaType: 'photo',
      });
      if (result.assets && result.assets[0].uri) {
        selectedImage = result.assets[0];
        console.log('사진 uri ', selectedImage);
      }
    }

    if (selectedImage) {
      const selectedUri = selectedImage.uri;
      console.log('얼굴등록 선택된 이미지: ', selectedUri);
      // FormData로 변환
      const formData = new FormData();
      formData.append('image', {
        uri: selectedUri,
        type: selectedImage.type || 'image/jpeg', // 기본 MIME 타입 설정
        name: selectedImage.fileName || 'photo.jpg', // 기본 파일 이름 설정
      });

      const uuploadFaceImage = `${selectedUri}?timestamp=${new Date().getTime()}`;
      setregisterImage(uuploadFaceImage); // 로컬 상태 업데이트 (미리보기용)
      // setfaceEmbedding(selectedUri || '');
      console.log('선택된 이미지 URI:', selectedUri);

      // 서버에 이미지 업로드
      await uploadFace(formData);
      // await fetchUser(); // 업데이트 후 사용자 정보 새로고침
    }
  };

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
        {registerImage ? (
          <PreviewImage source={{uri: registerImage}} />
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
