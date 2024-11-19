/**
 * @format
 */

import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
// import {name as appName} from './app.json';

// 백그라운드 메시지 처리 핸들러 설정
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('백그라운드에서 메시지 수신:', remoteMessage);

  // 여기에 백그라운드 알림 처리 로직 추가 (예: 상태 업데이트)
});
// 백그라운드 메시지 처리 태스크 등록
// AppRegistry.registerHeadlessTask(
//   'RNFirebaseBackgroundMessage',
//   () => async (remoteMessage) => {
//     console.log('백그라운드 메시지 수신:', remoteMessage);
//     // 메시지 처리 로직 추가
//   },
// );
// AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('moa', () => App);
