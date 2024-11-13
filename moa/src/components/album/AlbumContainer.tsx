import React, {useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import PhotoList from './PhotoList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import StyledModal from '../common/modal/StyledModal';
import RNFS from 'react-native-fs';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import uuid from 'react-native-uuid';
import LoadingSpinner from '../common/LoadingSpinner';
import {Images} from '../../types/moment';

const Container = styled.View`
  width: 100%;
  padding-bottom: 100px;
`;

const RowLine = styled.View`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const TitleLine = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Title = styled.Text`
  font-family: SCDream5;
  font-size: 15px;
  margin-right: 10px;
`;

const TitleNum = styled(Title)<{darkColor: string}>`
  color: ${({darkColor, theme}) => darkColor || theme.colors.maindarkorange};
`;

const SelectButton = styled.TouchableOpacity`
  width: 90px;
  height: 30px;
  background-color: ${({theme}) => theme.colors.mediumgray};
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 7px;
`;

const SelectButtonText = styled.Text`
  font-family: SCDream4;
  font-size: 13px;
  color: ${({theme}) => theme.colors.deepgray};
`;

const ButtonLine = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const OptionButton = styled.TouchableOpacity`
  width: 130px;
  height: 30px;
  border: 1px solid ${({theme}) => theme.colors.deepgray};
  border-radius: 10px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  margin-top: 5px;
  margin-bottom: 10px;
`;

const OptionButtonText = styled.Text`
  font-family: SCDream4;
  font-size: 13px;
`;

const DownloadButton = styled.TouchableOpacity<{
  lightColor: string;
}>`
  width: 90px;
  height: 30px;
  border-radius: 10px;
  background-color: ${({lightColor, theme}) =>
    lightColor || theme.colors.mainlightyellow};
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 7px;
`;

const DownloadButtonText = styled.Text<{
  darkColor: string;
}>`
  font-family: SCDream5;
  font-size: 13px;
  color: ${({darkColor, theme}) => darkColor || theme.colors.maindarkorange};
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

interface AlbumContainerProps {
  isGroup?: boolean;
  title: string;
  lightColor?: string;
  darkColor?: string;
  groupId?: string;
  momentId?: string;
  images: Images;
}

const AlbumContainer = ({
  isGroup = false,
  title,
  lightColor = '',
  darkColor = '',
  groupId,
  momentId,
  images,
}: AlbumContainerProps) => {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isOptionModalVisible, setIsOptionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const theme = useTheme();

  const options = [
    {id: 'mine', label: '내가 나온 사진'},
    {id: 'scenary', label: '풍경'},
    {id: 'food', label: '음식'},
  ];

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
  };

  const toggleOptionModal = () => {
    setIsOptionModalVisible(!isOptionModalVisible);
  };

  const handleSelectOption = (optionId: string) => {
    toggleOptionModal();

    if (optionId === 'mine') {
      toggleOptionModal();
    } else if (optionId === 'scenary') {
      toggleOptionModal();
    } else if (optionId === 'food') {
      toggleOptionModal();
    }
  };

  // 접근 권한 요청
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 30) {
          // Android 11 이상: MANAGE_EXTERNAL_STORAGE 권한 필요 -> WRITE이어도 되는데 나중에 배포 후 재테스트
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // Android 10 이하: WRITE_EXTERNAL_STORAGE 권한 요청
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // 사진 다운로드
  const handleDownload = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('권한 요청', '사진을 저장하려면 접근 권한이 필요합니다.');
      return;
    }

    if (selectedPhotos.length === 0) {
      Alert.alert('선택된 사진이 없습니다.');
      return;
    }
    try {
      const moaDir = `${RNFS.PicturesDirectoryPath}/MOA`;
      const dirExists = await RNFS.exists(moaDir);
      if (!dirExists) {
        await RNFS.mkdir(moaDir);
      }

      setLoading(true);

      await Promise.all(
        selectedPhotos.map(async (uri) => {
          const newUuid = uuid.v4();
          const fileName = isGroup
            ? `group_${groupId}_${newUuid}.jpg`
            : `moment_${momentId}_${newUuid}.jpg`;
          const downloadDest = `${moaDir}/${fileName}`;

          const downloadResult = await RNFS.downloadFile({
            fromUrl: uri,
            toFile: downloadDest,
          }).promise;

          if (downloadResult.statusCode === 200) {
            await RNFS.scanFile(downloadDest);
          } else {
            throw new Error('다운로드 실패');
          }
        }),
      );

      Alert.alert(
        '다운로드 완료',
        '선택된 이미지들이 갤러리에 저장되었습니다.',
      );
    } catch (error) {
      console.error('Download Error:', error);
      Alert.alert('다운로드 오류', '다운로드 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <RowLine>
        <TitleLine>
          <Title>{title}</Title>
          <TitleNum darkColor={darkColor}>{images.thumbImgs.length}장</TitleNum>
        </TitleLine>
        <SelectButton onPress={toggleSelectMode}>
          <Icon
            name="expand-circle-down"
            size={15}
            color={theme.colors.deepgray}
          />
          <SelectButtonText>
            {selectMode ? '선택취소' : '사진선택'}
          </SelectButtonText>
        </SelectButton>
      </RowLine>
      <ButtonLine>
        <OptionButton onPress={toggleOptionModal}>
          <Icon name="monochrome-photos" size={15} color={theme.colors.black} />
          <OptionButtonText>사진 분류 옵션</OptionButtonText>
        </OptionButton>
        <DownloadButton lightColor={lightColor} onPress={handleDownload}>
          <Icon
            name="download"
            size={15}
            color={darkColor ? darkColor : theme.colors.maindarkorange}
          />
          <DownloadButtonText darkColor={darkColor}>
            다운로드
          </DownloadButtonText>
        </DownloadButton>
      </ButtonLine>
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
      <PhotoList
        isSelectMode={selectMode}
        onSelectionChange={setSelectedPhotos}
      />
      {loading && <LoadingSpinner />}
    </Container>
  );
};

export default AlbumContainer;
