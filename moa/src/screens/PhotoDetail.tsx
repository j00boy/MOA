import React from 'react';
import ScreenContainer from '../components/common/ScreenContainer';
import styled from 'styled-components/native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../types/screen';
import {Dimensions, Image} from 'react-native';

const windowWidth = Dimensions.get('window').width * 0.88;

const StyledImage = styled.Image<{aspectRatio: number}>`
  width: ${windowWidth}px;
  height: ${({aspectRatio}) => windowWidth / aspectRatio}px;
  margin: auto;
`;

type PhotoDetailRouteProp = RouteProp<RootStackParamList, 'PhotoDetail'>;

const PhotoDetail = () => {
  const route = useRoute<PhotoDetailRouteProp>();
  const uri = route.params.uri;
  const [aspectRatio, setAspectRatio] = React.useState(1);

  React.useEffect(() => {
    if (uri) {
      Image.getSize(uri, (width, height) => {
        setAspectRatio(width / height);
      });
    }
  }, [uri]);

  return (
    <ScreenContainer>
      <StyledImage source={{uri}} aspectRatio={aspectRatio} />
    </ScreenContainer>
  );
};

export default PhotoDetail;
