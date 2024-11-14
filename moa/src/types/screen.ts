import {NavigatorScreenParams, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {GroupAddInfo} from './group';
import {MomentAddInfo} from './moment';

export type AppParamList = RootStackParamList & {
  Bottom: NavigatorScreenParams<BottomTabParamList>;
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
  MyPageStack: NavigatorScreenParams<MyPageStackParamList>;
  Add: undefined;
  GroupAdd: undefined;
  MomentAdd: undefined;
  Notification: undefined;
  Login: undefined;
};

export type RootStackParamList = {
  Bottom: NavigatorScreenParams<BottomTabParamList> | undefined;
  PhotoDetail: {uri: string};
  Add: undefined;
  GroupAdd: undefined;
  MomentAdd: undefined;
  Notification: undefined;
  Login: undefined;
};

export type BottomTabParamList = {
  HomeStack: undefined;
  MyPageStack: undefined;
};

export type AppNavigationProp = StackNavigationProp<AppParamList>;

// HomeStack의 ParamList 타입 정의
export type HomeStackParamList = {
  Home: undefined;
  GroupDetail: {groupId: string};
  MomentDetail: {momentId: string};
};

export type GroupDetailRouteProp = RouteProp<HomeStackParamList, 'GroupDetail'>;
export type MomentDetailRouteProp = RouteProp<
  HomeStackParamList,
  'MomentDetail'
>;

// Home 화면에서 사용하는 네비게이션 타입
export type HomeScreenNavigationProp = StackNavigationProp<
  HomeStackParamList,
  'Home'
>;

// MyPageStack의 ParamList 타입 정의
export type MyPageStackParamList = {
  MyPage: undefined;
  // 여기에 스크린 추가
};

// MyPage 화면에서 사용하는 네비게이션 타입
export type MyPageScreenNavigationProp =
  StackNavigationProp<MyPageStackParamList>;

// App Header의 ParamList 타입 정의
export type AppHeaderParamList = {
  Home: undefined;
  Add: undefined;
  GroupAdd: {groupAddInfo: GroupAddInfo; isEdit: boolean};
  MomentAdd: {momentAddInfo: MomentAddInfo; isEdit: boolean};
  Notification: undefined;
};

// App Header에서 사용하는 네비게이션 타입
export type AppHeaderNavigationProp = StackNavigationProp<AppHeaderParamList>;

// Stack Header의 ParamList 타입 정의
export type StackHeaderParamList = {
  Notification: undefined;
};

// Stack Header에서 사용하는 네비게이션 타입
export type StackHeaderNavigationProp =
  StackNavigationProp<StackHeaderParamList>;
