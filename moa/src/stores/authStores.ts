// src/stores/authStore.ts
import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import {jwtDecode} from 'jwt-decode';
import api from '../utils/api';

interface AuthState {
  isAuthenticated: boolean;
  jwtToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  setAuthenticated: (
    authStatus: boolean,
    tokens?: {accessToken: string; refreshToken: string},
  ) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    // persist로 상태 영구히 관리
    (set, get) => ({
      isAuthenticated: false,
      jwtToken: null,
      userId: null,
      refreshToken: null,

      // 인증 상태를 설정하는 함수
      setAuthenticated: async (authStatus, tokens) => {
        if (authStatus && tokens) {
          const {accessToken, refreshToken} = tokens;

          await AsyncStorage.setItem('jwtToken', accessToken);
          await AsyncStorage.setItem('refreshToken', refreshToken);

          const decodedToken = jwtDecode<{userId: string}>(accessToken);
          const userId = decodedToken.userId;

          set({
            isAuthenticated: true,
            jwtToken: accessToken,
            refreshToken,
            userId,
          });
        } else {
          set({
            isAuthenticated: false,
            jwtToken: null,
            refreshToken: null,
            userId: null,
          });
        }
      },

      // AsyncStorage에서 토큰을 가져와 인증 상태 확인
      checkAuthStatus: async () => {
        const accessToken = await AsyncStorage.getItem('jwtToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          const decodedToken = jwtDecode<{userId: string}>(accessToken);
          const userId = decodedToken.userId;

          set({
            isAuthenticated: true,
            jwtToken: accessToken,
            refreshToken,
            userId,
          });
        } else {
          set({
            isAuthenticated: false,
            jwtToken: null,
            refreshToken: null,
            userId: null,
          });
        }
      },

      // 리프레시 토큰으로 새로운 액세스 토큰 요청
      refreshAccessToken: async (): Promise<string | null> => {
        try {
          // const { refreshToken } = useAuthStore.getState();
          const {refreshToken} = get();
          if (!refreshToken) {
            throw new Error('리프레시 토큰이 없습니다.');
          }

          const response = await api.post(
            '/refresh',
            {},
            {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            },
          );

          const {accessToken} = response.data;

          // 새 액세스 토큰 저장
          await AsyncStorage.setItem('jwtToken', accessToken);

          set({jwtToken: accessToken});

          return accessToken;
        } catch (error) {
          console.error('새로운 액세스 토큰 발급 실패', error);
          return null;
        }
      },

      // 로그아웃 및 AsyncStorage에서 토큰 제거
      logout: async () => {
        await AsyncStorage.removeItem('jwtToken');
        await AsyncStorage.removeItem('refreshToken');
        set({
          isAuthenticated: false,
          jwtToken: null,
          refreshToken: null,
          userId: null,
        });
      },
    }),
    {
      name: 'kakao-auth-storage', // AsyncStorage에 저장할 키 이름
      //createJSONStorage -> AsyncStorage를 Zustand와 호환되도록 자동으로 JSON으로 직렬화/역직렬화
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
