import {Modal, TouchableWithoutFeedback} from 'react-native';
import React, {ReactNode} from 'react';
import styled from 'styled-components/native';

const ModalOverlay = styled.TouchableOpacity`
  flex: 1;
  background-color: 'rgba(0, 0, 0, 0.5)';
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.View`
  width: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({theme}) => theme.colors.white};
  border-radius: 10px;
`;

interface StyledModalProps {
  children: ReactNode;
  isModalVisible: boolean;
  toggleModal: () => void;
  canClickOverlay?: boolean;
}

const StyledModal = ({
  children,
  isModalVisible,
  toggleModal,
  canClickOverlay = true,
}: StyledModalProps) => {
  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      onRequestClose={toggleModal}
      animationType="fade"
    >
      <ModalOverlay
        activeOpacity={1}
        onPress={canClickOverlay ? toggleModal : undefined}
      >
        <TouchableWithoutFeedback>
          <ModalContainer>{children}</ModalContainer>
        </TouchableWithoutFeedback>
      </ModalOverlay>
    </Modal>
  );
};

export default StyledModal;
