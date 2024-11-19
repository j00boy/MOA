// src/styles/GlobalStyles.ts
import {css} from 'styled-components/native';

export const GlobalStyles = css`
  font-family: 'SCDream5';
  font-size: ${({theme}) => theme.fontSize.extralarge};
  color: ${({theme}) => theme.colors.darkyellow};
`;
