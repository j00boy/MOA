import React from 'react';
import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';

const Container = styled.View<{itemSize: number}>`
  width: ${({itemSize}) => itemSize}px;
  min-height: 100px;
  align-items: center;
  justify-content: space-between;
  margin-right: 15px;
`;

const StyledImage = styled.Image<{itemSize: number}>`
  width: ${({itemSize}) => itemSize}px;
  height: ${({itemSize}) => itemSize}px;
  border: 2px solid ${({theme}) => theme.colors.mediumgray};
  border-radius: 50px;
`;

const NameLine = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Name = styled.Text`
  font-family: 'SCDream5';
  font-size: 12px;
  color: ${({theme}) => theme.colors.deepgray};
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const IsMe = styled(Name)`
  color: ${({theme}) => theme.colors.maindarkorange};
`;

const IsMeText = styled(IsMe)`
  font-size: 10px;
`;

const Owner = styled(Name)`
  font-size: 10px;
`;

interface MemberListItemProps {
  userName: string;
  userImage: string;
  itemSize: number;
  isMe: boolean;
  isOwner: boolean;
}

const MemberListItem = ({
  userName,
  userImage,
  itemSize,
  isMe,
  isOwner,
}: MemberListItemProps) => {
  return (
    <Container itemSize={itemSize}>
      <StyledImage source={{uri: userImage}} itemSize={itemSize} />
      <NameLine>
        {isMe ? (
          <>
            <IsMe>{userName}</IsMe>
            <IsMeText>&nbsp;(나)</IsMeText>
          </>
        ) : (
          <>
            <Name>{userName}</Name>
            {isOwner && <Owner>&nbsp;(관리자)</Owner>}
          </>
        )}
      </NameLine>
    </Container>
  );
};

export default MemberListItem;
