import {create} from 'zustand';

// 남은 시간을 계산하는 유틸리티 함수
function calculateRemainingTime(createdAt: string): number {
  const now = new Date().getTime();
  const createdTime = new Date(createdAt).getTime();
  const endTime = createdTime + 24 * 60 * 60 * 1000; // 24시간 후
  return Math.max(0, endTime - now); // 남은 시간이 음수가 되지 않도록 처리
}

// Zustand 상태 인터페이스 정의
interface TimerState {
  remainingTime: number; // 남은 시간 (ms)
  isExpired: boolean; // 타이머 만료 여부
  setTimer: (createdAt: string) => void; // 타이머 설정 함수
  updateTimer: () => void; // 타이머 업데이트 함수
}

// Zustand 스토어 생성
export const useTimerStore = create<TimerState>((set) => ({
  remainingTime: 0, // 초기값
  isExpired: false,

  // 타이머 설정 함수
  setTimer: (createdAt: string) => {
    const remainingTime = calculateRemainingTime(createdAt);
    set({
      remainingTime,
      isExpired: remainingTime === 0,
    });
  },

  // 타이머 업데이트 함수 (1초마다 호출)
  updateTimer: () => {
    set((state) => {
      const updatedTime = Math.max(0, state.remainingTime - 1000); // 1초 감소
      return {
        remainingTime: updatedTime,
        isExpired: updatedTime === 0,
      };
    });
  },
}));
