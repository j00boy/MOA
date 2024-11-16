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
        title: `${message}`,
        imageUrl: 'src/assets/images/logo.png',
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
