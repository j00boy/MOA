import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persist, createJSONStorage} from 'zustand/middleware';
import api from '../utils/api';

interface User {
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  userEmail: string;
  userImage: string;
  role: string;
  deviceToken: string;
  // faceEmbedding: string | null;
  registerImage: string | null;
}

interface GroupMember {
  memberId: number;
  nickname: string;
  joinDate: string;
}

interface UserGroup {
  createdAt: string;
  updatedAt: string;
  groupId: number;
  groupPin: string;
  groupName: string;
  groupDescription: string;
  groupIcon: string;
  groupColor: string;
  members: GroupMember[];
}

interface UserStore {
  user: User | null;
  userGroups: UserGroup[] | null;
  fetchUser: () => Promise<void>;
  // updateUser: (updatedData: Partial<User>) => Promise<void>;
  // updateUser: (
  //   updatedData: Partial<User> & {nickname: string; image?: File},
  // ) => Promise<void>;
  updateUser: (urlWithNickname: string, formData: FormData) => Promise<void>;
  uploadFace: (formData: FormData) => Promise<void>;
  updateDeviceToken: (deviceToken: string) => Promise<void>;
  fetchUserGroups: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  userGroups: null,

  // 사용자 정보 조회
  fetchUser: async () => {
    try {
      const response = await api.get('/user');

      const userData = response.data;

      // 클라이언트 측 userImage에만 timestamp 추가
      const updatedUserImageUrl = userData.userImage
        ? `${userData.userImage}?timestamp=${new Date().getTime()}`
        : '';

      // 클라이언트 측 registerImage에만 timestamp 추가
      const updatedRegisterImage = userData.registerImage
        ? `${userData.registerImage}?timestamp=${new Date().getTime()}`
        : '';

      set({
        user: {
          ...userData,
          userImage: updatedUserImageUrl, // 클라이언트 측 캐시 무효화용 URL
          registerImage: updatedRegisterImage, //클라이언트 측 캐시 무효화용 registerImage
        },
      });
      // set({user: response.data});
      console.log('받은 유저 정보: ', response.data);
    } catch (error) {
      console.error('사용자 정보 불러오기 실패:', error);
      set({user: null});
    }
  },

  // 유저 정보 (닉네임, 프로필사진) 수정
  updateUser: async (urlWithNickname: string, formData: FormData) => {
    try {
      const response = await api.put(urlWithNickname, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('사용자 정보 수정 성공', response.data);
      // set({user: response.data});
      // 상태 업데이트: 캐시 무효화된 URL 적용
      set((state) => ({
        user: {
          ...state.user!,
          ...response.data,
          userImage: response.data.userImage
            ? `${response.data.userImage}?timestamp=${new Date().getTime()}`
            : '', // 캐시 무효화된 userImage
        },
      }));
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
    }
  },

  // 디바이스 토큰 업데이트
  updateDeviceToken: async (deviceToken) => {
    try {
      set((state) => {
        const user = state.user;
        if (user) {
          // 서버로 API 요청 전송
          api
            .put('/user/device-token', {deviceToken})
            .then(() => {
              console.log('디바이스 토큰 업데이트 성공');
            })
            .catch((error) => {
              console.error('디바이스 토큰 업데이트 실패:', error);
            });

          // 상태 업데이트
          return {
            user: {...user, deviceToken},
          };
        } else {
          console.warn('user 정보를 찾을 수 없습니다.');
          return state;
        }
      });
    } catch (error) {
      console.error('디바이스 토큰 업데이트 실패:', error);
    }
  },

  // 얼굴 등록
  uploadFace: async (formData: FormData) => {
    try {
      const response = await api.post('/user/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('사용자 얼굴 등록: ', response.data);
      // set({user: response.data})
      set((state) => ({
        user: {
          ...state.user!, //state.user!로 user가 null이 아님을 보장하여 타입 오류를 방지
          // registerImage: response.data.url,
          registerImage: `${response.data.url}?timestamp=${new Date().getTime()}`, // 캐시 무효화된 URL
        },
      }));
    } catch (error) {}
  },

  // 사용자 그룹 조회
  fetchUserGroups: async () => {
    try {
      const response = await api.get('/user/groups');
      set({userGroups: response.data});
      console.log('유저 그룹 조회 성공');
    } catch (error) {
      console.error('유저 그룹 조회 실패:', error);
      set({userGroups: null});
    }
  },

  // 사용자 정보 초기화
  clearUser: () => set({user: null, userGroups: null}),
}));
