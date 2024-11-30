import React from 'react';
import styled from 'styled-components/native';
import {MomentInfo} from '../../../types/moment';
import {useNavigation} from '@react-navigation/native';
import {HomeScreenNavigationProp} from '../../../types/screen';
import {formatDate} from '../../../utils/common';

const Container = styled.TouchableOpacity`
  width: 99%;
  height: 85px;
  border-radius: 20px;
  border-style: solid;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.maindarkyellow};
  elevation: 3;
  background-color: ${({theme}) => theme.colors.white};
  display: flex;
  padding: 14px;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const TitleLine = styled.View`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.Text`
  font-family: SCDream5;
  font-size: 18px;
  max-width: 60%;
  overflow: hidden;
`;

const Date = styled.Text`
  font-family: SCDream4;
  font-size: 13px;
`;

const Owner = styled.Text`
  font-family: SCDream5;
  font-size: 14px;
  color: ${({theme}) => theme.colors.deepgray};
`;

interface MyMomentListItemProps {
  momentInfo: MomentInfo;
}

const MyMomentListItem = ({momentInfo}: MyMomentListItemProps) => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <Container
      onPress={() =>
        navigation.navigate('MomentDetail', {
          momentId: momentInfo.momentId,
        })
      }
    >
      <TitleLine>
        <Title numberOfLines={1} ellipsizeMode="tail">
          {momentInfo.momentTitle}
        </Title>
        <Date>{formatDate(momentInfo.createdAt)}</Date>
      </TitleLine>
      <Owner>{momentInfo.momentOwner}</Owner>
    </Container>
  );
};

export default MyMomentListItem;
