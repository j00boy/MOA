import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import PhotoListItem from './PhotoListItem';
import {Images} from '../../types/moment';
import {GroupImages} from '../../types/group';

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
