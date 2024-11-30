import React from 'react';
import styled from 'styled-components/native';
import {Dimensions} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Container = styled.View`
  position: relative;
  left: -8%;
  width: ${screenWidth}px;
  height: 8px;
  background-color: ${({theme}) => theme.colors.lightgray};
  margin: 15px 0;
`;

const Partition = () => {
  return <Container />;
};

export default Partition;
