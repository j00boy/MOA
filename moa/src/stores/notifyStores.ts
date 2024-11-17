import {create} from 'zustand';

interface NotificationState {
  groupId: string | null;
  momentId: string | null;
  setGroupId: (id: string) => void;
  setMomentId: (id: string) => void;
}

const useNotificationStore = create<NotificationState>((set) => ({
  groupId: null,
  momentId: null,
  setGroupId: (id) => set({groupId: id}),
  setMomentId: (id) => set({momentId: id}),
}));

export default useNotificationStore;
