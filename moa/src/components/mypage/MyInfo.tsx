import React, {useEffect, useState} from 'react';
import styled, {css, useTheme} from 'styled-components/native';
import {IconButton} from '../common/button/IconButton';
import {useUserStore} from '../../stores/userStores';
import {TextInput, View, TouchableOpacity, Button} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';

interface TextProps {
  variant: 'title' | 'subtitle' | 'body';
  color?: string;
}

const UserInfo = styled.View`
  border-radius: 15px;
  elevation: 2;
  height: 120px;
  background-color: ${(props) => props.theme.colors.white};
  margin: 10px 0;
  padding: 20px 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const TextInfo = styled.View`
  flex-direction: column;
  width: 210px;
  color: ${(props) => props.theme.colors.black};
  height: 100%;
  justify-content: space-between;
`;

const Texts = styled.Text<TextProps>`
  ${({variant, theme, color}) => {
    const textColor = color || theme.colors.black;
    switch (variant) {
      case 'title':
        return css`
          font-size: 22px;
          font-family: ${theme.fontFamily.SCDream8};
          color: ${textColor};
        `;
      case 'subtitle':
        return css`
          font-size: 16px;
          font-family: ${theme.fontFamily.SCDream6};
          color: ${textColor};
          margin: 0 0 5px 0;
        `;
      case 'body':
      default:
        return css`
          font-size: 13px;
          font-family: ${theme.fontFamily.SCDream4};
          color: ${textColor};
          margin: 0 0 5px 0;
        `;
    }
  }}
`;

const Border = styled.View`
  flex-direction: row;
  align-items: top;
  padding: 0;
`;

const IconButtonStyled = styled.View`
  position: absolute;
  top: 8px;
  right: 8px;
`;

const MyProfile = styled.Image`
  border-radius: 50px;
  border: 1px solid ${(props) => props.theme.colors.lightgray};
  width: 75px;
  height: 75px;
  background-color: ${(props) => props.theme.colors.maindarkorange};
`;

const MyInfo = () => {
  const theme = useTheme();
  const {fetchUser, user, fetchUserGroups, userGroups, updateUser} =
    useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState(user?.userName || '');
  const [userImage, setUserImage] = useState(user?.userImage || '');

  useEffect(() => {
    fetchUser();
    fetchUserGroups();
  }, [fetchUser, fetchUserGroups]);

  useEffect(() => {
    if (user) {
      setUserName(user?.userName || '');
      setUserImage(user?.userImage || '');
    }
  }, [user]);

  const handleSave = async () => {
    await updateUser({userName, userImage}); // 업데이트된 정보 전송
    setIsEditing(false);
    fetchUser(); // 업데이트 후 사용자 정보 다시 불러오기
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      maxWidth: 200,
      maxHeight: 200,
      quality: 1,
    });

    if (result.assets && result.assets[0].uri) {
      setUserImage(result.assets[0].uri);
    }
  };

  return (
    <UserInfo>
      <TextInfo>
        <Border style={{paddingVertical: 8}}>
          {isEditing ? (
            <TextInput
              value={userName}
              onChangeText={setUserName}
              placeholder="닉네임 입력"
              style={{
                marginRight: 5,
                fontSize: 14,
                fontFamily: theme.fontFamily.SCDream4,
                textDecorationLine: 'none',
                color: theme.colors.black,
                height: 24,
                width: 100,
                borderColor: theme.colors.maindarkorange,
                borderRadius: 7,
                borderWidth: 1,
                textAlignVertical: 'bottom', // 텍스트를 수직 중앙 정렬
                margin: 0,
                padding: 0,
                paddingLeft: 8,
              }}
              maxLength={5}
              selectionColor={theme.colors.maindarkorange}
              underlineColorAndroid="transparent"
            />
          ) : (
            <Texts variant="subtitle" color={theme.colors.maindarkorange}>
              {user?.userName}
            </Texts>
          )}
          <Texts variant="subtitle">님 안녕하세요!</Texts>
        </Border>
        <Texts variant="body">내 그룹 | {userGroups?.length} 개</Texts>
        <Texts variant="body">누적 업로드 사진 수 | 장</Texts>
      </TextInfo>
      <TouchableOpacity
        onPress={isEditing ? pickImage : undefined}
        activeOpacity={isEditing ? 0.7 : 1}
      >
        <MyProfile
          source={{uri: userImage}}
          style={{
            borderColor: isEditing
              ? theme.colors.maindarkorange
              : theme.colors.lightgray, // 동적 테두리 색상
            borderWidth: isEditing ? 2 : 1, // 테두리 두께
          }}
        />
      </TouchableOpacity>
      <IconButtonStyled>
        {isEditing ? (
          <IconButton
            backcolor="white"
            iconName="save"
            iconSet="Material"
            onPress={() => handleSave()}
          />
        ) : (
          <IconButton
            backcolor="white"
            iconName="edit"
            iconSet="Material"
            onPress={() => setIsEditing(true)}
          />
        )}
      </IconButtonStyled>
    </UserInfo>
  );
};

export default MyInfo;
