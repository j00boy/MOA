import React from 'react';
import {FlatList} from 'react-native';
import ScreenContainer from '../components/common/ScreenContainer';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Container = styled.View`
  flex: 1;
  padding: 10px;
`;

const NotificationItem = styled.View`
  margin-bottom: 20px;
  flex-direction: columns;
  padding: 15px;
  background-color: ${(props) => props.theme.colors.white};
  border-radius: 15px;
  border: 1px solid ${(props) => props.theme.colors.mainlightorange};
  elevation: 4;
`;
const Wrapper = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 310px;
  margin-bottom: 10px;
`;

const Title = styled.Text`
  font-size: 16px;
  font-family: ${(props) => props.theme.fontFamily.SCDream5};
`;

const ReceivedAt = styled.Text`
  font-size: 10px;
  font-family: ${(props) => props.theme.fontFamily.SCDream3};
  color: ${(props) => props.theme.colors.maindarkorange};
`;

const Body = styled.Text`
  font-size: 14px;
  color: ${(props) => props.theme.colors.deepgray};
  font-family: ${(props) => props.theme.fontFamily.SCDream4};
`;

const Notification = () => {
  const dummyNotifications = [
    {
      id: 1,
      title: '새로운 사진',
      body: '그룹 [자율]에 새로운 추억이 추가되었습니다.',
      receivedAt: '2024-11-17T12:00:00Z',
    },
    {
      id: 2,
      title: '새로운 사진',
      body: '그룹 [가족]에 새로운 추억이 추가되었습니다.',
      receivedAt: '2024-11-17T12:10:00Z',
    },
    {
      id: 3,
      title: '새로운 사진',
      body: '그룹 [회사]에 새로운 추억이 추가되었습니다.',
      receivedAt: '2024-11-17T12:30:00Z',
    },
  ];

  // 새로운 알림이 위로 오도록 정렬
  const sortedNotifications = dummyNotifications.sort(
    (a, b) =>
      new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
  );

  return (
    <ScreenContainer>
      {/* <View>
        <Text>Notification</Text>
      </View> */}
      <Container>
        <FlatList
          data={sortedNotifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => (
            <NotificationItem>
              <Wrapper>
                <Title>{item.title}</Title>
                <ReceivedAt>
                  {new Date(item.receivedAt).toLocaleString()}
                </ReceivedAt>
              </Wrapper>
              <Body>{item.body}</Body>
            </NotificationItem>
          )}
        />
      </Container>
    </ScreenContainer>
  );
};

export default Notification;
