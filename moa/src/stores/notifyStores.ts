import {create} from 'zustand';

interface Notification {
  id?: number | string;
  title?: string;
  body?: string;
  receivedAt?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications], // 최신 알림을 배열 상단에 추가
    })),
}));

export default useNotificationStore;
