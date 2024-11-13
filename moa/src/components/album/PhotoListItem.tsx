import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useNavigation} from '@react-navigation/native';
import {AppNavigationProp} from '../../types/screen';

const Container = styled.TouchableOpacity<{
  itemSize: number;
  isLastInRow: boolean;
}>`
  width: ${({itemSize}) => itemSize}px;
  height: ${({itemSize}) => itemSize}px;
  margin-bottom: 5px;
  margin-right: ${({isLastInRow}) => (isLastInRow ? '0px' : '5px')};
`;

const StyledImage = styled.Image<{itemSize: number}>`
  width: ${({itemSize}) => itemSize}px;
  height: ${({itemSize}) => itemSize}px;
`;

const CheckButton = styled.View`
  position: absolute;
  top: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  border-radius: 100%;
  border: 1px solid ${({theme}) => theme.colors.mediumgray};
  background-color: ${({theme}) => theme.colors.lightgray};
  justify-content: center;
  align-items: center;
`;

interface PhotoListItemProps {
  uri: string;
  isSelected: boolean;
  onToggleSelect: () => void;
  itemSize: number;
  isLastInRow: boolean;
  isSelectMode?: boolean;
}

const PhotoListItem = ({
  uri,
  isSelected,
  onToggleSelect,
  itemSize,
  isLastInRow,
  isSelectMode = false,
}: PhotoListItemProps) => {
  const theme = useTheme();
  const navigation = useNavigation<AppNavigationProp>();

  const handleSelectPhoto = () => {
    if (isSelectMode) {
      onToggleSelect();
    } else {
      navigation.navigate('PhotoDetail', {uri: uri});
    }
  };

  return (
    <Container
      itemSize={itemSize}
      isLastInRow={isLastInRow}
      onPress={handleSelectPhoto}
    >
      <StyledImage
        itemSize={itemSize}
        source={{
          uri,
        }}
        resizeMode="cover"
      />
      {isSelectMode && (
        <CheckButton>
          {isSelected && (
            <Icon name="check" size={10} color={theme.colors.deepgray} />
          )}
        </CheckButton>
      )}
    </Container>
  );
};

export default PhotoListItem;
