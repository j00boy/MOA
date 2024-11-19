import React, {ReactNode} from 'react';
import styled from 'styled-components/native';
import TextInput from './TextInput';

const Container = styled.View`
  width: 100%;
  min-height: 120px;
  background-color: ${({theme}) => theme.colors.lightgray};
  padding: 20px;
  display: flex;
  justify-content: space-between;
  border-radius: 10px;
  margin-bottom: 15px;
`;

const Label = styled.Text`
  font-family: SCDream4;
  font-size: 16px;
  margin-bottom: 20px;
`;

interface AddInputBoxProps {
  label: string;
  isText?: boolean;
  children?: ReactNode;
  value?: string;
  onChangeText?: (text: string) => void;
}

const AddInputBox = ({
  label,
  isText = true,
  children,
  value,
  onChangeText,
}: AddInputBoxProps) => {
  return (
    <Container>
      <Label>{label}</Label>
      {isText ? (
        <TextInput value={value} onChangeText={onChangeText} />
      ) : (
        <>{children}</>
      )}
    </Container>
  );
};

export default AddInputBox;
