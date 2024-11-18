/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, RefreshControl, Alert, View} from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import MemberList from '../../components/member/MemberList';
import MomentDetailHeader from '../../components/moment/momentDetail/MomentDetailHeader';
import {
  HomeStackParamList,
  StackHeaderNavigationProp,
} from '../../types/screen';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import StackHeader from '../../components/common/header/StackHeader';
import AlbumContainer from '../../components/album/AlbumContainer';
import api from '../../utils/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {MomentInfoDetail} from '../../types/moment';
import PinPostModal from '../../components/common/modal/PinPostModal';
import {AxiosError} from 'axios';
import Partition from '../../components/common/Partition';

type FlatListDataItem = {
  key: string;
  content: JSX.Element;
};

type MomentDetailRouteProp = RouteProp<HomeStackParamList, 'MomentDetail'>;

const MomentDetail: React.FC = () => {
  const navigation = useNavigation<StackHeaderNavigationProp>();
  const route = useRoute<MomentDetailRouteProp>();

  const [momentInfoDetail, setMomentInfoDetail] = useState<MomentInfoDetail>({
    id: '',
    groupId: '',
    momentPin: '',
    members: [],
    momentName: '',
    momentDescription: '',
    momentOwner: {userId: '', nickname: '', imageSrc: ''},
    images: {thumbImgs: []},
    createdAt: '',
    uploadOption: '',
  });
  const [loading, setLoading] = useState(false);
  const [enterLoading, setEnterLoading] = useState(false);
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const momentId = route.params.momentId;

  const toggleModal = () => {
    setIsPinModalVisible(!isPinModalVisible);
  };

  const handleLoadingChange = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const getMomentDetail = useCallback(async () => {
    setLoading(true);
    setEnterLoading(true);

    try {
      const response = await api.get(`/moment/${momentId}`);
      setMomentInfoDetail(response?.data);
      setEnterLoading(false);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data.status === 403) {
        toggleModal();
      } else {
        Alert.alert('', '나의 순간 조회 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [momentId]);

  useEffect(() => {
    getMomentDetail();
  }, [getMomentDetail]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getMomentDetail();
    });
    return unsubscribe;
  }, [navigation, getMomentDetail]);

  useFocusEffect(
    useCallback(() => {
      getMomentDetail();
    }, [momentId]),
  );

  useEffect(() => {
    if (momentInfoDetail) {
      navigation.setOptions({
        header: () => <StackHeader title={momentInfoDetail.momentName} />,
      });
    }
  }, [momentInfoDetail, momentInfoDetail.momentName, navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getMomentDetail();
    setRefreshing(false);
  }, []);

  const data: FlatListDataItem[] = [
    {
      key: 'header',
      content: (
        <MomentDetailHeader
          momentInfoDetail={momentInfoDetail}
          onLoadingChange={handleLoadingChange}
        />
      ),
    },
    {key: 'partition1', content: <Partition />},
    {
      key: 'members',
      content: (
        <MemberList
          owner={momentInfoDetail.momentOwner}
          memberList={momentInfoDetail.members}
        />
      ),
    },
    {key: 'partition2', content: <Partition />},
    {
      key: 'album',
      content: (
        <AlbumContainer
          title="공유된 사진"
          momentId={momentId}
          images={momentInfoDetail.images}
        />
      ),
    },
  ];

  return (
    <ScreenContainer>
      {loading || enterLoading ? (
        <LoadingSpinner isDark={false} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.key}
          renderItem={({item}) => <View>{item.content}</View>}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <PinPostModal
        id={momentId}
        isModalVisible={isPinModalVisible}
        toggleModal={toggleModal}
        onSuccess={getMomentDetail}
      />
    </ScreenContainer>
  );
};

export default MomentDetail;
