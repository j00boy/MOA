/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  HomeStackParamList,
  StackHeaderNavigationProp,
} from '../../types/screen';
import StackHeader from '../../components/common/header/StackHeader';
import GroupDetailHeader from '../../components/group/groupDetail/GroupDetailHeader';
import AlbumContainer from '../../components/album/AlbumContainer';
import MemberList from '../../components/member/MemberList';
import {lightColorMap, darkColorMap} from '../../utils/groupColor';
import Partition from '../../components/common/Partition';
import api from '../../utils/api';
import {GroupInfoDetail} from '../../types/group';
import {AxiosError} from 'axios';
import {Alert, RefreshControl, FlatList} from 'react-native';
import PinPostModal from '../../components/common/modal/PinPostModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

type GroupDetailRouteProp = RouteProp<HomeStackParamList, 'GroupDetail'>;

const GroupDetail: React.FC = () => {
  const navigation = useNavigation<StackHeaderNavigationProp>();
  const route = useRoute<GroupDetailRouteProp>();

  const [groupInfoDetail, setGroupInfoDetail] = useState<GroupInfoDetail>({
    group: {
      groupId: '',
      groupPin: '',
      groupName: '',
      groupDescription: '',
      groupIcon: '',
      groupColor: '',
      groupTotalImages: '',
      createdAt: '',
    },
    users: [],
    groupOwner: {userId: '', nickname: '', imageSrc: ''},
    images: {thumbImgs: {}},
    expiredAt: {},
  });
  const [loading, setLoading] = useState(false);
  const [enterLoading, setEnterLoading] = useState(false);
  const [lightColor, setLightColor] = useState('');
  const [darkColor, setDarkColor] = useState('');
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const groupId = route.params.groupId;

  const toggleModal = () => {
    setIsPinModalVisible(!isPinModalVisible);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const getGroupDetail = useCallback(async () => {
    setLoading(true);
    setEnterLoading(true);

    try {
      const response = await api.get(`/group/${groupId}`);
      setGroupInfoDetail(response?.data);
      setEnterLoading(false);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data.status === 403) {
        toggleModal();
      } else {
        Alert.alert('', '나의 그룹 조회 도중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    getGroupDetail();
  }, [getGroupDetail]);

  useFocusEffect(
    useCallback(() => {
      getGroupDetail();
    }, [groupId]),
  );

  useEffect(() => {
    if (groupInfoDetail) {
      navigation.setOptions({
        header: () => <StackHeader title={groupInfoDetail.group.groupName} />,
      });

      setLightColor(lightColorMap[groupInfoDetail.group.groupColor]);
      setDarkColor(darkColorMap[groupInfoDetail.group.groupColor]);
    }
  }, [groupInfoDetail, groupInfoDetail?.group, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getGroupDetail();
    setRefreshing(false);
  }, []);

  const renderItem = ({item}: {item: string}) => {
    switch (item) {
      case 'header':
        return (
          <GroupDetailHeader
            group={groupInfoDetail.group}
            owner={groupInfoDetail.groupOwner}
            lightColor={lightColor}
            darkColor={darkColor}
            onLoadingChange={handleLoadingChange}
          />
        );
      case 'members':
        return (
          <MemberList
            owner={groupInfoDetail.groupOwner}
            memberList={groupInfoDetail.users}
            darkColor={darkColor}
          />
        );
      case 'album':
        return (
          <AlbumContainer
            title="다운 가능한 사진"
            isGroup={true}
            lightColor={lightColor}
            darkColor={darkColor}
            groupId={groupId}
            images={groupInfoDetail.images}
            expiredAt={groupInfoDetail.expiredAt}
          />
        );
      default:
        return null;
    }
  };

  if (enterLoading || loading) {
    return <LoadingSpinner isDark={false} />;
  }

  return (
    <ScreenContainer>
      <FlatList
        data={['header', 'members', 'album']}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <Partition />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <PinPostModal
        isGroup={true}
        id={groupId}
        isModalVisible={isPinModalVisible}
        toggleModal={toggleModal}
        onSuccess={getGroupDetail}
      />
    </ScreenContainer>
  );
};

export default GroupDetail;
