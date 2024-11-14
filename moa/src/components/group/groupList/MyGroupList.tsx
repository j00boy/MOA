import React from 'react';
import MyGroupListItem from './MyGroupListItem';
import styled from 'styled-components/native';

const Container = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
`;

interface MyGroupListProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const MyGroupList = ({refreshing, onRefresh}: MyGroupListProps) => {
  return (
    <Container>
      {groupList.map((group) => (
        <MyGroupListItem key={group.groupId} groupInfo={group} />
      ))}
    </Container>
  );
};

export default MyGroupList;
