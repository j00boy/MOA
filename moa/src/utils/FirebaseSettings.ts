import messaging from '@react-native-firebase/messaging';
// import {Alert} from 'react-native';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import notifee, {
  AuthorizationStatus,
  AndroidImportance,
} from '@notifee/react-native';
import useNotificationStore from '../stores/notifyStores';
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

    if (remoteMessage.notification?.title && remoteMessage.notification?.body) {
      // Notifee로 커스텀 알림 표시
      await notifee.displayNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        android: {
          channelId: 'default',
          smallIcon: 'moa_logo', // Android에서 사용할 작은 아이콘
          color: '#FF0000', // 아이콘 색상
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });

      const notification = {
        id: remoteMessage.messageId,
        title: remoteMessage.notification?.title || '알림',
        body: remoteMessage.notification?.body || '',
        receivedAt: new Date().toISOString(),
      };

      // Zustand 스토어에 상태 업데이트
      useNotificationStore.setState((state) => ({
        notifications: [notification, ...state.notifications],
      }));
    }

    // 아래는 추후 삭제
    // Alert.alert(
    //   '알림이 도착했습니다!',
    //   JSON.stringify(remoteMessage.notification),
    // );
  });
}

// Background/Terminated 상태에서의 알림 처리 핸들러
// export function setupBackgroundMessageHandler() {
//   messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//     console.log('백그라운드 알림:', remoteMessage);

//     if (remoteMessage.notification?.title && remoteMessage.notification?.body) {
//       const notification = {
//         id: remoteMessage.messageId || Date.now(),
//         title: remoteMessage.notification.title,
//         body: remoteMessage.notification.body,
//         receivedAt: new Date().toISOString(),
//       };

//       // Zustand 스토어에 상태 업데이트
//       useNotificationStore.setState((state) => ({
//         notifications: [notification, ...state.notifications],
//       }));
//     }
//   });
// }

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const fcmToken = await messaging().getToken();
    console.log('[FCM Token] ', fcmToken);
    return fcmToken; // FCM 토큰을 명시적으로 반환
  } catch (error) {
    console.error('FCM 토큰 가져오기 실패:', error);
    return null; // 오류가 발생하면 null 반환
  }
};

// 알림 채널 생성
export async function createNotificationChannel() {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH, // 알림 중요도
  });
  console.log('Notification Channel 생성됨:', channelId);
}

// 앱 초기화 시 호출
createNotificationChannel();
