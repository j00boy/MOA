// 앱 전체에서 사용할 색상, 폰트, 간격 등 전역적인 테마 설정
// 값 자체 정의
// ThemeProvider 적용: App.tsx에서 ThemeProvider로 theme을 주입하여 앱 전체에서 사용할 수 있도록 설정
// props.theme.colors.primary 등으로 접근
import 'styled-components';
export const theme = {
  colors: {
    maindarkorange: '#FF8521',
    mainlightorange: '#FFBF78',
    maindarkyellow: '#FFEEA9',
    mainlightyellow: '#FEFFD2',
    lightred: '#FAE5E3',
    lightyellow: '#FAEFD2',
    lightgreen: '#E4F2EB',
    lightblue: '#D9EAFA',
    lightpurple: '#F0E6F7',
    lightpink: '#FAE6EF',
    darkred: '#F26D68',
    darkyellow: '#FA9923',
    darkgreen: '#3CB580',
    darkblue: '#2A70BF',
    darkpurple: '#B666E8',
    darkpink: '#F569B1',
    lightgray: '#F8F8F8',
    mediumgray: '#F2F2F2',
    deepgray: '#838383',
    white: '#FFFFFF',
    black: '#000000',
  },
  fontSize: {
    small: '13px',
    regular: '16px',
    large: '18px',
    extralarge: '24px',
  },
  fontWeight: {
    light: '200',
    regular: '400',
    bold: '600',
    extrabold: '900',
  },
  fontFamily: {
    SCDream1: 'SCDream1',
    SCDream2: 'SCDream2',
    SCDream3: 'SCDream3',
    SCDream4: 'SCDream4',
    SCDream5: 'SCDream5',
    SCDream6: 'SCDream6',
    SCDream7: 'SCDream7',
    SCDream8: 'SCDream8',
    SCDream9: 'SCDream9',
  },
};
export type ThemeType = typeof theme;
