import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import PhotoListItem from './PhotoListItem';

const Container = styled.View`
  width: 100%;
  padding: 10px 0;
  flex-direction: row;
  flex-wrap: wrap;
`;

interface PhotoListProps {
  isSelectMode?: boolean;
  onSelectionChange: (selectedPhotos: string[]) => void;
}

const PhotoList = ({
  isSelectMode = false,
  onSelectionChange,
}: PhotoListProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const itemSize = (containerWidth - 3 * 5) / 4;
  const numColumns = 4;

  // 테스트용 데이터 -> 나중에 삭제
  const photoList = [
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672c22722a98f4294e24fe0e/8424d95c-4b8b-468d-84bf-c8322f0c4298.png',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672c22722a98f4294e24fe0e/8e3e274a-80b9-4439-bfc4-e3ff7b7f6517.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672c22722a98f4294e24fe0e/98a13dbe-99cf-438a-82f7-7ab521204ce8.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/606ee1a9-1102-491b-b111-0763df47667a.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/10603f76-acde-402a-b8d1-911f3da7eaab.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/423ba529-6de7-4240-a19e-398f6ea6173e.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/4e365099-2d03-4777-8745-9a1e3005c76d.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/f248b9e3-f02f-4780-92aa-d1805c5d09a8.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/f059df6e-2e07-4213-93c2-b5ac951dc1ee.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/ecad71f9-1620-43e3-8083-18bae3b2e6d9.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/c54a6e94-b3a9-4621-823d-c340aa74e7e3.jpg',
    },
    {
      uri: 'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com/group/200/moment/672d5c67afb4954e6bd4f243/e6246267-2a84-49b7-ba6e-074b9be12a54.jpg',
    },
  ];

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

  return (
    <Container
      onLayout={(event) => {
        const {width} = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      {photoList.map((photo, index) => (
        <PhotoListItem
          key={photo.uri}
          uri={photo.uri}
          isSelected={selectedPhotos.includes(photo.uri)}
          onToggleSelect={() => toggleSelect(photo.uri)}
          itemSize={itemSize}
          isLastInRow={(index + 1) % numColumns === 0}
          isSelectMode={isSelectMode}
        />
      ))}
    </Container>
  );
};

export default PhotoList;
