import React from 'react';
import styled from 'styled-components/native';

const InputContainer = styled.TextInput`
  width: 100%;
  height: 45px;
  background-color: ${({theme}) => theme.colors.white};
  padding: 10px;
  font-family: SCDream4;
  font-size: 18px;
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}) => theme.colors.maindarkorange};
`;

interface TextInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
}

const TextInput = ({value = '', onChangeText = () => {}}: TextInputProps) => {
  return <InputContainer value={value} onChangeText={onChangeText} />;
};

export default TextInput;
