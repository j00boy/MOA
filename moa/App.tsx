/* eslint-disable react/no-unstable-nested-components */
import React, {useState, useEffect, useRef} from 'react';
import styled, {ThemeProvider} from 'styled-components/native';
import {theme} from './src/styles/theme';
import Navigation from './src/components/common/Navigation';
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './src/screens/Home';
import MyPage from './src/screens/MyPage';
import Notification from './src/screens/Notification';
import Add from './src/screens/Add';
import GroupAdd from './src/screens/group/GroupAdd';
import GroupDetail from './src/screens/group/GroupDetail';
import MomentAdd from './src/screens/moment/MomentAdd';
import MomentDetail from './src/screens/moment/MomentDetail';
import AppHeader from './src/components/common/header/AppHeader';
import StackHeader from './src/components/common/header/StackHeader';
import {Linking, StatusBar} from 'react-native';
import {
  AppParamList,
  HomeStackParamList,
  MyPageStackParamList,
} from './src/types/screen';
import Login from './src/screens/Login';
import Toast from 'react-native-toast-message';
import {LinkingOptions} from '@react-navigation/native';
import {useAuthStore} from './src/stores/authStores';
import {
  requestUserPermission,
  // setupBackgroundMessageHandler,
  setupForegroundMessageHandler,
  getFcmToken,
  requestNotificationPermission,
  createNotificationChannel,
} from './src/utils/FirebaseSettings';
import PhotoDetail from './src/screens/PhotoDetail';
import messaging from '@react-native-firebase/messaging';

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator();

const CustomTabBar: React.FC<BottomTabBarProps> = (props) => (
  <Navigation {...props} />
);

// 홈 화면(모아) 스택 구조
const HomeStack = createStackNavigator<HomeStackParamList>();

const HomeStackScreen: React.FC = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen
      name="Home"
      component={Home}
      options={({navigation}) => ({
        header: () => <AppHeader navigation={navigation} />,
      })}
    />
    <HomeStack.Screen name="GroupDetail" component={GroupDetail} />
    <HomeStack.Screen name="MomentDetail" component={MomentDetail} />
  </HomeStack.Navigator>
);

// 마이페이지 스택 구조
const MyPageStack = createStackNavigator<MyPageStackParamList>();

const MyPageStackScreen: React.FC = () => (
  <MyPageStack.Navigator>
    <MyPageStack.Screen
      name="MyPage"
      component={MyPage}
      options={({navigation}) => ({
        header: () => <AppHeader navigation={navigation} />,
      })}
    />
  </MyPageStack.Navigator>
);

// Tab Navigator 구성
const TabNavigator: React.FC = () => (
  <Tab.Navigator
    tabBar={CustomTabBar}
    screenOptions={{tabBarHideOnKeyboard: true}}
  >
    <Tab.Screen
      name="HomeStack"
      component={HomeStackScreen}
      options={{headerShown: false}}
    />
    <Tab.Screen
      name="MyPageStack"
      component={MyPageStackScreen}
      options={{headerShown: false}}
    />
  </Tab.Navigator>
);

// 딥링크 설정
const linking: LinkingOptions<AppParamList> = {
  prefixes: [
    'kakao4a3fdb040f645b2e0bba4c975b6b8ba5://',
    'moa://',
    'https://k11a602.p.ssafy.io',
  ],
  config: {
    screens: {
      Bottom: {
        screens: {
          HomeStack: {
            screens: {
              Home: '',
              GroupDetail: 'group/:groupId',
              MomentDetail: 'moment/:momentId',
            },
          },
          MyPageStack: 'mypage',
        },
      },
    },
  },
};

const StyledSafeAreaView = styled.SafeAreaView`
  flex: 1;
`;

const App = () => {
  const {isAuthenticated, checkAuthStatus} = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const navigationRef = useRef<NavigationContainerRef<AppParamList>>();

  // 링크 열기 시 실행할 메소드 정의
  const handleOpenURL = (event: {url: string}) => {
    const {url} = event;
    console.log('Opened from link:', url);

    if (url.includes('group')) {
      const groupId = url.includes('kakao')
        ? url.split('=').pop()
        : url.split('/').pop();

      if (groupId) {
        navigationRef.current?.navigate('HomeStack', {
          screen: 'GroupDetail',
          params: {groupId},
        });
      }
    }

    if (url.includes('moment')) {
      const momentId = url.includes('kakao')
        ? url.split('=').pop()
        : url.split('/').pop();

      if (momentId) {
        navigationRef.current?.navigate('HomeStack', {
          screen: 'MomentDetail',
          params: {momentId},
        });
      }
    }
  };

  useEffect(() => {
    if (isNavigationReady) {
      Linking.getInitialURL().then((url) => {
        if (url) handleOpenURL({url});
      });

      const urlListener = Linking.addListener('url', handleOpenURL);
      return () => urlListener.remove();
    }
  }, [isNavigationReady]);

  useEffect(() => {
    const initAuthStatus = async () => {
      await checkAuthStatus(); // 로그인 상태 확인
      setLoading(false); // 로딩 완료
    };
    initAuthStatus();
  }, [checkAuthStatus]);

  // Firebase 알림 권한 요청
  useEffect(() => {
    requestUserPermission();
    requestNotificationPermission();
    setupForegroundMessageHandler();
    // setupBackgroundMessageHandler();
    getFcmToken();
    createNotificationChannel();

    // 앱이 백그라운드 상태일 때 알림 클릭 처리
    const unsubscribeBackgroundListener = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        console.log(
          '백그라운드에서 알림 클릭으로 앱이 열림:',
          remoteMessage.notification,
        );
        // 알림에 따라 네비게이션 또는 추가 작업 처리
      },
    );

    // 앱이 종료된 상태에서 알림 클릭 처리
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            '앱이 종료된 상태에서 알림 클릭으로 열림:',
            remoteMessage.notification,
          );
          // 초기화 작업 또는 네비게이션 처리
        }
      });

    // 컴포넌트가 unmount될 때 백그라운드 리스너 정리
    return () => {
      unsubscribeBackgroundListener();
    };
  }, []);
  // const navigationRef =
  //   useRef<NavigationContainerRef<HomeStackParamList>>(null);
  if (loading) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <StyledSafeAreaView>
        <NavigationContainer
          linking={linking}
          ref={(ref) => {
            if (ref) {
              navigationRef.current = ref;
              setIsNavigationReady(true);
            }
          }}
        >
          <RootStack.Navigator>
            {isAuthenticated ? (
              <>
                <RootStack.Screen
                  name="Bottom"
                  component={TabNavigator}
                  options={{headerShown: false}}
                />
                <RootStack.Screen
                  name="PhotoDetail"
                  component={PhotoDetail}
                  options={() => ({
                    header: () => <StackHeader title="사진 상세보기" />,
                    tabBarStyle: {display: 'none'},
                  })}
                />
                <RootStack.Screen
                  name="Add"
                  component={Add}
                  options={() => ({
                    header: () => <StackHeader title="모아 만들기" />,
                    tabBarStyle: {display: 'none'},
                  })}
                />
                <RootStack.Screen
                  name="GroupAdd"
                  component={GroupAdd}
                  options={() => ({
                    header: () => <StackHeader title="그룹 생성" />,
                  })}
                />
                <RootStack.Screen name="MomentAdd" component={MomentAdd} />
                <RootStack.Screen
                  name="Notification"
                  component={Notification}
                  options={{
                    header: () => <StackHeader title="알림" />,
                  }}
                />
              </>
            ) : (
              <RootStack.Screen
                name="Login"
                component={Login}
                options={{headerShown: false}} // 로그인 화면에 헤더 숨기기
              />
            )}
            {/* 여기에 Screen 추가 */}
          </RootStack.Navigator>
        </NavigationContainer>
      </StyledSafeAreaView>
      <Toast />
    </ThemeProvider>
  );
};

export default App;
// export {default} from './.storybook';
