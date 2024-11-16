import Share from 'react-native-share';
import {Text} from 'react-native';

export const onShare = async (name: string, link: string) => {
  try {
    const shareOptions = {
      // title: `${name} 공유하기`,
      message: `${link}`,
    };

    await Share.open(shareOptions);

    // // 콘솔 추후 수정 예정
    // if (result.action === Share.sharedAction) {
    //   if (result.activityType) {
    //     console.log('공유 완료:', result.activityType);
    //   } else {
    //     console.log('공유가 완료되었습니다.');
    //   }
    // } else if (result.action === Share.dismissedAction) {
    //   console.log('공유가 취소되었습니다.');
    // }
  } catch (error) {
    console.error('공유 오류:', error);
  }
};

import {Linking, Platform} from 'react-native';

export const shareToKakaoUsingIntent = async (link: string) => {
  if (Platform.OS === 'android') {
    const intentUrl = `kakaolink://send?url=${encodeURIComponent(link)}`;

    try {
      const isSupported = await Linking.canOpenURL(intentUrl);
      if (isSupported) {
        await Linking.openURL(intentUrl);
      } else {
        console.error('카카오톡이 설치되지 않았습니다.');
      }
    } catch (error) {
      console.error('카카오톡 공유 오류:', error);
    }
  }
};
