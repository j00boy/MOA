import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {Svg, Path} from 'react-native-svg';

// 추후 수정필요
const Hourglass = () => {
  const topSandHeight = useRef(new Animated.Value(10)).current; // 위쪽 모래 높이 (작게 시작)
  const bottomSandHeight = useRef(new Animated.Value(10)).current; // 아래쪽 모래 높이 (작게 시작)

  useEffect(() => {
    // 위쪽 모래가 줄어드는 애니메이션
    Animated.loop(
      Animated.timing(topSandHeight, {
        toValue: 0, // 위쪽 모래가 줄어듦
        duration: 4000, // 4초 동안
        useNativeDriver: false,
      }),
    ).start();

    // 아래쪽 모래가 쌓이는 애니메이션
    Animated.loop(
      Animated.timing(bottomSandHeight, {
        toValue: 10, // 아래쪽 모래가 쌓임
        duration: 4000, // 위쪽 모래와 동기화
        useNativeDriver: false,
      }),
    ).start();
  }, [topSandHeight, bottomSandHeight]);

  return (
    <View style={styles.container}>
      {/* 모래시계 외곽 */}
      <Svg width="30" height="50" viewBox="0 0 50 80">
        {/* 위쪽 모래 */}
        <Path
          d="M25 40C35 40 40 30 40 20H10C10 30 15 40 25 40Z"
          fill="#FFBF78"
        />
        {/* 아래쪽 모래 */}
        <Path
          d="M25 40C35 40 40 50 40 60H10C10 50 15 40 25 40Z"
          fill="#FF8521"
        />
      </Svg>

      {/* 위쪽에서 줄어드는 모래 */}
      <Animated.View
        style={[
          styles.topSand,
          {
            height: topSandHeight, // 모래 높이 줄어듦
            top: topSandHeight.interpolate({
              inputRange: [5, 30], // 모래의 높이 변화
              outputRange: [10, 40], // 50(아래쪽) → 20(위쪽)
            }),
          },
        ]}
      />

      {/* 아래쪽에서 쌓이는 모래 */}
      <Animated.View
        style={[
          styles.bottomSand,
          {
            height: bottomSandHeight, // 모래 높이 증가
            bottom: bottomSandHeight.interpolate({
              inputRange: [5, 40], // 모래의 높이 변화
              outputRange: [10, 90], // 20(위쪽) → 50(아래쪽)
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 30, // 전체 컨테이너 크기 (작게 설정)
    height: 50,
  },
  topSand: {
    position: 'absolute',
    top: 10, // 위쪽 모래 시작 위치
    left: 12,
    width: 6, // 모래 폭
    backgroundColor: '#FFBF78',
  },
  bottomSand: {
    position: 'absolute',
    bottom: 10, // 아래쪽 모래 시작 위치
    left: 12,
    width: 6, // 모래 폭
    backgroundColor: '#FF8521',
  },
});

export default Hourglass;
