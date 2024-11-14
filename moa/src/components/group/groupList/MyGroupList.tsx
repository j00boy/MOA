import React, {useEffect, useState} from 'react';
import MyGroupListItem from './MyGroupListItem';
import styled from 'styled-components/native';
import {Alert} from 'react-native';
import {GroupInfo} from '../../../types/group';
import {HomeScreenNavigationProp} from '../../../types/screen';
import {useNavigation} from '@react-navigation/native';
import api from '../../../utils/api';
import LoadingSpinner from '../../common/LoadingSpinner';

const Container = styled.View`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  padding: 0 2%;
`;

const NullText = styled.Text`
  font-family: 'SCDream4';
  font-size: 15px;
  color: ${({theme}) => theme.colors.deepgray};
  margin-top: 50px;
`;

interface MyGroupListProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const MyGroupList = ({refreshing, onRefresh}: MyGroupListProps) => {
  const [loading, setLoading] = useState(false);
  const [groupList, setGroupList] = useState<GroupInfo[]>();

  const navigation = useNavigation<HomeScreenNavigationProp>();

  const handleGetGroupList = async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/groups');
      setGroupList(response?.data);
    } catch {
      Alert.alert(
        '그룹 조회 오류',
        '나의 순간 목록을 불러오는 중 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetGroupList();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      handleGetGroupList();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (refreshing) {
      handleGetGroupList();
      onRefresh();
    }
  }, [refreshing, onRefresh]);

  return (
    <Container>
      {groupList?.map((group) => (
        <MyGroupListItem key={group.groupId} groupInfo={group} />
      ))}
      {groupList?.length === 0 && <NullText>가입한 그룹이 없습니다.</NullText>}
      {loading && <LoadingSpinner isDark={false} />}
    </Container>
  );
};

export default MyGroupList;
