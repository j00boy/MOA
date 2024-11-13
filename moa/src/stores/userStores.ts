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
  faceEmbedding: string | null;
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
  updateUser: (updatedData: Partial<User>) => Promise<void>;
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
      set({user: response.data});
      console.log('받은 유저 정보: ', response.data);
    } catch (error) {
      console.error('사용자 정보 불러오기 실패:', error);
      set({user: null});
    }
  },

  // 사용자 정보 수정
  updateUser: async (updatedData) => {
    try {
      const response = await api.put('/user', updatedData);
      set({user: response.data});
      console.log('사용자 정보 수정 성공');
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
    }
  },

  // 디바이스 토큰 업데이트
  // updateDeviceToken: async (deviceToken) => {
  //   try {
  //     await api.put('/user/device-token', {deviceToken});
  //     set((state) => ({
  //       user: state.user ? {...state.user, deviceToken} : null,
  //     }));
  //     console.log('디바이스 토큰 업데이트 성공');
  //     console.log('넘어가는 정보?:', user);
  //   } catch (error) {
  //     console.error('디바이스 토큰 업데이트 실패:', error);
  //   }
  // },
  updateDeviceToken: async (deviceToken) => {
    try {
      // 현재 상태에서 user 가져오기
      set((state) => {
        const user = state.user;
        if (user && user.userId) {
          const payload = {
            userId: user.userId, // userId 포함
            deviceToken, // deviceToken 포함
          };

          // 서버로 API 요청 전송
          api
            .put('/user/device-token', payload)
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
          console.warn('userId를 찾을 수 없습니다.');
          return state;
        }
      });
    } catch (error) {
      console.error('디바이스 토큰 업데이트 실패:', error);
    }
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
