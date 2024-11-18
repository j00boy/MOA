import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import PhotoListItem from './PhotoListItem';
import {Images} from '../../types/moment';
import {GroupImages} from '../../types/group';
import {
  differenceInHours,
  formatDuration,
  intervalToDuration,
  parseISO,
} from 'date-fns';

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
  selectedPhotos: string[];
  onSelectionChange: (selectedPhotos: string[]) => void;
}

const PhotoList = ({
  images,
  isGroup = false,
  expiredAt,
  isSelectMode = false,
  selectedPhotos,
  onSelectionChange,
}: PhotoListProps) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const itemSize = (containerWidth - 3 * 5) / 4;
  const numColumns = 4;

  let imageArray: string[] = [];
  const remainingTimes: Record<string, number | null> = {};

  if (isGroup && expiredAt && typeof images.thumbImgs === 'object') {
    Object.entries(images.thumbImgs).forEach(([key, array]) => {
      if (Array.isArray(array)) {
        imageArray.push(...array);
        const expirationDate = expiredAt[key];
        if (expirationDate) {
          const now = new Date();
          const parsedDate = parseISO(expirationDate);
          if (parsedDate > now) {
            remainingTimes[key] = differenceInHours(parsedDate, now);
          } else {
            remainingTimes[key] = null;
          }
        }
      }
    });
  } else {
    imageArray = images.thumbImgs as string[];
  }

  const toggleSelect = (uri: string) => {
    const updatedPhotos = selectedPhotos.includes(uri)
      ? selectedPhotos.filter((photo) => photo !== uri)
      : [...selectedPhotos, uri];
    onSelectionChange(updatedPhotos);
  };

  useEffect(() => {
    onSelectionChange(selectedPhotos);
  }, [onSelectionChange, selectedPhotos]);

  return (
    <Container
      onLayout={(event) => {
        const {width} = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {imageArray.map((photo, index) => {
        const associatedKey = isGroup
          ? Object.keys(images.thumbImgs).find((key) =>
              (images.thumbImgs as Record<string, string[]>)[key].includes(
                photo,
              ),
            )
          : null;

        const remainingTime = associatedKey
          ? remainingTimes[associatedKey]
          : null;

        return (
          <PhotoListItem
            key={photo}
            uri={photo}
            isSelected={selectedPhotos.includes(photo)}
            onToggleSelect={() => toggleSelect(photo)}
            itemSize={itemSize}
            isLastInRow={(index + 1) % numColumns === 0}
            isSelectMode={isSelectMode}
            remainingTime={remainingTime} // 몇 시간 남았는지 전달
          />
        );
      })}
      {imageArray.length === 0 && <NullText>공유된 사진이 없습니다.</NullText>}
    </Container>
  );
};

export default PhotoList;
