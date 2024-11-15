// src/utils/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthStore} from '../stores/authStores';

const api = axios.create({
  baseURL: 'https://k11a602.p.ssafy.io/api',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  async (config) => {
    // 토큰을 로컬 저장소에서 가져와 헤더에 추가
    const accessToken = await AsyncStorage.getItem('jwtToken'); // 추후에 실제 토큰 값으로 변경
    if (accessToken) {
      console.log('jwt토큰 확인 ', accessToken);
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 401 에러 처리
    if (error.response && error.response.status === 401) {
      console.error('401 Unauthorized, 토큰 갱신 시도. 다시 로그인 해주세요');
      // const {refreshAccessToken} = useAuthStore();
      const {refreshAccessToken} = useAuthStore.getState();
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        const originalRequest = error.config;
        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api.request(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
