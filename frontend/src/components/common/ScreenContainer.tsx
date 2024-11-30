import React, {ReactNode} from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  width: 100%;
  height: 100%;
  padding: 5% 6%;
  background-color: ${({theme}) => theme.colors.white};
`;

interface PageContainerProps {
  children: ReactNode;
}

const ScreenContainer: React.FC<PageContainerProps> = ({children}) => {
  return <Container>{children}</Container>;
};

export default ScreenContainer;
