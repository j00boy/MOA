import React, {useState} from 'react';
import styled from 'styled-components/native';
import MemberListItem from './MemberListItem';
import {FlatList} from 'react-native';
import {Member} from '../../types/moment';
import {useAuthStore} from '../../stores/authStores';

const Container = styled.View`
  width: 100%;
`;

const TitleLine = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled.Text`
  font-family: SCDream5;
  font-size: 15px;
  margin-right: 10px;
`;

const TitleNum = styled(Title)<{darkColor: string}>`
  color: ${({darkColor, theme}) => darkColor || theme.colors.maindarkorange};
`;

interface MemberListProps {
  owner: Member;
  memberList: Member[];
  darkColor?: string;
}

const MemberList = ({owner, memberList, darkColor = ''}: MemberListProps) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const userId = useAuthStore((state) => state.userId);
  const itemSize = (containerWidth - 3 * 15) / 4;

  const sortedMemberList = [
    ...memberList.filter((member) => member.userId === userId),
    ...memberList.filter(
      (member) => member.userId !== userId && member.userId === owner.userId,
    ),
    ...memberList.filter(
      (member) => member.userId !== userId && member.userId !== owner.userId,
    ),
  ];

  return (
    <Container
      onLayout={(event) => {
        const {width} = event.nativeEvent.layout;
        setContainerWidth(width);
      }}
    >
      <TitleLine>
        <Title>참여중인 멤버</Title>
        <TitleNum darkColor={darkColor}>{memberList?.length}명</TitleNum>
      </TitleLine>
      <FlatList
        data={sortedMemberList}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({item}) => (
          <MemberListItem
            userName={item.nickname}
            userImage={item.imageSrc}
            itemSize={itemSize}
            isMe={item.userId === userId}
            isOwner={item.userId !== userId && item.userId === owner.userId}
          />
        )}
      />
    </Container>
  );
};

export default MemberList;
