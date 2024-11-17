import React, {useEffect, useState, useRef} from 'react';
import styled from 'styled-components/native';
import PhotoListItem from './PhotoListItem';
import {Images} from '../../types/moment';
import {GroupImages} from '../../types/group';
import useNotificationStore from '../../stores/notifyStores';
import api from '../../utils/api';

const Container = styled.View`
  width: 100%;
  padding: 10px 0;
  flex-direction: row;
  flex-wrap: wrap;
`;

const NullText = styled.Text`
  font-family: 'SCDream4';
  font-size: 15px;
  color: ${({theme}) => theme.colors.deepgray};
  margin-top: 20px;
  width: 100%;
  text-align: center;
`;

interface PhotoListProps {
  images: Images | GroupImages;
  isGroup?: boolean;
  expiredAt?: Record<string, string>;
  isSelectMode?: boolean;
  onSelectionChange: (selectedPhotos: string[]) => void;
}

const PhotoList = ({
  images,
  isGroup = false,
  expiredAt,
  isSelectMode = false,
  onSelectionChange,
}: PhotoListProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const itemSize = (containerWidth - 3 * 5) / 4;
  const numColumns = 4;

  let imageArray: string[] = [];

  // 사진 개수 상태 useRef로 관리
  const [isInitialized, setIsInitialized] = useState(false); // 초기 렌더링 상태
  const prevImageCountRef = useRef<number>(imageArray.length);
  console.log('맨처음 prev~', prevImageCountRef.current);
  // groupId, momentId 불러오기
  const {groupId} = useNotificationStore();
  console.log('그룹 id? ', groupId);

  if (isGroup) {
    Object.values(images.thumbImgs as Record<string, string[]>).forEach(
      (array) => {
        if (Array.isArray(array)) {
          imageArray.push(...array);
        }
      },
    );
  } else {
    imageArray = images.thumbImgs as string[];
  }

  const toggleSelect = (uri: string) => {
    setSelectedPhotos((prev) =>
      prev.includes(uri)
        ? prev.filter((photo) => photo !== uri)
        : [...prev, uri],
    );
  };

  useEffect(() => {
    onSelectionChange(selectedPhotos);
  }, [onSelectionChange, selectedPhotos]);

  // 초기화 완료
  useEffect(() => {
    // imageArray 초기화 완료 상태 확인
    if (!isInitialized && imageArray.length > 0) {
      setIsInitialized(true); // 초기화 완료
      prevImageCountRef.current = imageArray.length; // 초기값 설정
      console.log('초기 렌더링 완료. 초기값 설정:', imageArray.length);
    }
  }, [imageArray]);

  // 사진 개수 변화 감지
  useEffect(() => {
    if (!isInitialized) {
      // 초기화 완료 전에는 작업하지 않음
      console.log('초기화 중입니다. 작업하지 않습니다.');
      return;
    }

    console.log('기존 사진 개수: ', prevImageCountRef.current);

    if (imageArray.length > prevImageCountRef.current) {
      // 사진 추가 감지
      console.log('사진 추가!');
      const sendNotification = async () => {
        try {
          // api 명세서상에는 그룹 푸쉬알람만 되어 잇음
          // 추후 순간 푸쉬알림이 구현되면 주석 해제
          // const payload = groupId
          //   ? { groupId }
          //   : momentId
          //   ? { momentId }
          //   : null;

          // if (payload) {
          if (groupId) {
            const response = await api.post('/alarm', groupId);

            if (response.data === 1) {
              console.log('푸시 알림 전송 성공');
            } else {
              console.warn('푸시 알림 전송 실패');
            }
          }
        } catch (error) {
          console.error('푸시 알림 전송 중 오류:', error);
        }
      };
      sendNotification();
      prevImageCountRef.current = imageArray.length; // 현재 이미지 개수 업데이트
      console.log(
        '지금은? 현재 PrevImageCountRef.current 개수: ',
        prevImageCountRef.current,
      );
    }

    // setPrevImageCount(imageArray.length); // 현재 이미지 개수 업데이트

    // }, [imageArray.length, groupId, momentId, prevImageCount]);
  }, [imageArray.length, groupId, isInitialized]);

  return (
    <Container
      onLayout={(event) => {
        const {width} = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {imageArray.map((photo, index) => (
        <PhotoListItem
          key={photo}
          uri={photo}
          isSelected={selectedPhotos.includes(photo)}
          onToggleSelect={() => toggleSelect(photo)}
          itemSize={itemSize}
          isLastInRow={(index + 1) % numColumns === 0}
          isSelectMode={isSelectMode}
        />
      ))}
      {imageArray.length === 0 && <NullText>공유된 사진이 없습니다.</NullText>}
    </Container>
  );
};

export default PhotoList;
