/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unstable-nested-components */
import React, {useCallback, useEffect, useState} from 'react';
import ScreenContainer from '../../components/common/ScreenContainer';
import MemberList from '../../components/member/MemberList';
import styled from 'styled-components/native';
import MomentDetailHeader from '../../components/moment/momentDetail/MomentDetailHeader';
import Partition from '../../components/common/Partition';
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
import {Alert, RefreshControl} from 'react-native';
import PinPostModal from '../../components/common/modal/PinPostModal';
import {AxiosError} from 'axios';

const Container = styled.ScrollView.attrs({
  nestedScrollEnabled: true,
})`
  width: 100%;
`;

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
      console.log(response?.data);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data.status === 403) {
        toggleModal();
      } else {
        Alert.alert('순간 조회 오류', '나의 순간 조회 중 오류가 발생했습니다.');
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
    await getMomentDetail(); // 새로고침 시 데이터를 다시 불러옴
    setRefreshing(false); // 새로고침 완료 후 false로 설정
  }, []);

  useEffect(() => {
    if (refreshing) {
      getMomentDetail();
      onRefresh();
    }
  }, [refreshing, onRefresh]);

  return (
    <ScreenContainer>
      {loading ? (
        <LoadingSpinner isDark={false} />
      ) : (
        <Container
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <MomentDetailHeader
            momentInfoDetail={momentInfoDetail}
            onLoadingChange={handleLoadingChange}
          />
          <Partition />
          <MemberList
            owner={momentInfoDetail.momentOwner}
            memberList={momentInfoDetail.members}
          />
          <Partition />
          <AlbumContainer
            title="공유된 사진"
            momentId={momentId}
            images={momentInfoDetail.images}
          />
        </Container>
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
