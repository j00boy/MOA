import {shareFeedTemplate} from '@react-native-kakao/share';
import KakaoShareLink from 'react-native-kakao-share-link';

export const kakaoShare = async () => {
  try {
    const response = await KakaoShareLink.sendFeed({
      content: {
        title: '모아 초대',
        imageUrl: 'src/assets/images/logo.png',
        link: {
          webUrl: 'moa://group/611',
          mobileWebUrl: 'moa://group/611',
        },
      },
      buttons: [
        {
          title: '앱에서 보기',
          link: {
            androidExecutionParams: [{key: 'groupId', value: '611'}],
            iosExecutionParams: [{key: 'test', value: 'from Kakao App'}],
          },
        },
      ],
    });
  } catch (e) {
    console.error(e);
  }
};

export const sendFeedMessage = async (name: string, id: string) => {
  console.log('공유 버튼 눌렀음');
  const url = `https://k11a602.p.ssafy.io/group`;

  console.log(url);

  try {
    await shareFeedTemplate({
      template: {
        content: {
          title: `${name}에 초대합니다!`,
          description: `${name}에서 우리만의 추억을 쌓아보아요`,
          imageUrl: 'https://your-image-url.com/image.png', // 이미지 URL
          link: {
            mobileWebUrl: url, // 모바일 웹 링크
            // mobileWebUrl: 'https://your.com', // 모바일 웹 링크
            webUrl: url, // PC 웹 링크
            // webUrl: 'https://your.com', // PC 웹 링크
          },
        },
        // social: {
        //   likeCount: 100, // 좋아요 개수
        //   commentCount: 45, // 댓글 개수
        //   sharedCount: 20, // 공유 개수
        // },
        buttons: [
          {
            title: '앱에서 열기',
            link: {
              androidExecutionParams: {id: url}, // 객체 형식으로 변경
              iosExecutionParams: {id: 'moment'}, // 객체 형식으로 변경
            },
          },
        ],
      },
      useWebBrowserIfKakaoTalkNotAvailable: true, // 카카오톡이 설치되지 않은 경우 웹 브라우저로 열기
      serverCallbackArgs: {
        key1: 'value1',
        key2: 'value2',
      },
    });
    console.log('카카오톡으로 피드 메시지 공유 성공');
  } catch (error) {
    console.error('카카오톡 피드 메시지 공유 실패:', error);
  }
};
