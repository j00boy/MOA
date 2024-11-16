import Share from 'react-native-share';
import KakaoShareLink from 'react-native-kakao-share-link';

export const onShare = async (message: string, link: string) => {
  try {
    const shareOptions = {
      message: `${message}\n`,
      url: `${link}`,
    };
    await Share.open(shareOptions);
  } catch (error) {
    console.log('공유 오류:', error);
  }
};

export const kakaoShare = async (
  key: string,
  id: string,
  message: string,
  deepLink: string,
) => {
  try {
    await KakaoShareLink.sendFeed({
      content: {
        title: 'MOA에 초대합니다!',
        imageUrl:
          'https://moa-s3-bucket.s3.ap-northeast-2.amazonaws.com//logo/MOA_logo.png',
        description: `${message}`,
        // imageWidth?: number;
        // imageHeight?: number;
        link: {
          webUrl: `${deepLink}`,
          mobileWebUrl: `${deepLink}`,
        },
      },
      buttons: [
        {
          title: '앱에서 보기',
          link: {
            androidExecutionParams: [{key: `${key}`, value: `${id}`}],
            iosExecutionParams: [{key: `${key}`, value: `${id}`}],
          },
        },
      ],
    });
  } catch (error) {
    console.log(error);
  }
};
