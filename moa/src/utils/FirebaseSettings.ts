import messaging from '@react-native-firebase/messaging';
// import {Alert} from 'react-native';
import {Alert, PermissionsAndroid, Platform} from 'react-native';

/**
 * Android 13 이상에서 알림 권한 요청
 */
export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('알림 권한이 허용되었습니다.');
      } else {
        console.log('알림 권한이 거부되었습니다.');
      }
    } catch (err) {
      console.warn('알림 권한 요청 중 오류 발생:', err);
    }
  } else {
    console.log(
      'Android 13 미만 버전에서는 알림 권한 요청이 필요하지 않습니다.',
    );
  }
};

// 알림 권한 요청 함수
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('알림 권한이 활성화되었습니다.');
  } else {
    console.log('알림 권한이 비활성화되었습니다.');
  }
}

// Foreground 메시지 수신 핸들러
export function setupForegroundMessageHandler() {
  messaging().onMessage(async (remoteMessage) => {
    console.log('알림 왔다!', remoteMessage);
    Alert.alert(
      '알림이 도착했습니다!',
      JSON.stringify(remoteMessage.notification),
    );
  });
}

// Background/Terminated 상태에서의 알림 처리 핸들러
export function setupBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('백그라운드 알림:', remoteMessage);
  });
}

export const getFcmToken = async () => {
  const fcmToken = await messaging().getToken();
  console.log('[FCM Token] ', fcmToken);
};
