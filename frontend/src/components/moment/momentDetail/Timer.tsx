import React, {useEffect} from 'react';
import styled from 'styled-components/native';
import {useTimerStore} from '../../../stores/timeStores';
import Hourglass from './HourGlass';

const Container = styled.View`
  margin-left: 10px;
  flex-direction: row;
`;
const LeftTime = styled.Text`
  font-family: SCDream5;
  font-size: 15px;
  color: ${(props) => props.theme.colors.maindarkorange};
`;

interface TimerProps {
  createdAt: string;
}

const Timer = ({createdAt}: TimerProps) => {
  const {remainingTime, setTimer, updateTimer} = useTimerStore(); // Zustand 스토어 활용

  useEffect(() => {
    setTimer(createdAt); // 타이머 초기화
    const interval = setInterval(() => {
      updateTimer(); // 1초마다 남은 시간 업데이트
    }, 1000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 클리어
  }, [createdAt, setTimer, updateTimer]);

  // 남은 시간을 포맷팅하여 반환
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}시간 ${minutes}분 ${seconds}초`;
  };

  return (
    <Container>
      {/* <Hourglass /> */}
      <LeftTime>
        {remainingTime > 0 ? `${formatTime(remainingTime)}` : '타이머 종료'}
      </LeftTime>
    </Container>
  );
};

export default Timer;
