/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import styled, {css, useTheme} from 'styled-components/native';
import {IconButton} from '../common/button/IconButton';
import {useUserStore} from '../../stores/userStores';
import {TextInput, TouchableOpacity} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';

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

const MyProfile = styled(FastImage)`
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
  const [userImage, setUserImage] = useState('');
  const [imageFile, setImageFile] = useState<{
    uri: string;
    type: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    fetchUser();
    fetchUserGroups();
  }, [fetchUser, fetchUserGroups]);

  useEffect(() => {
    if (user?.userImage) {
      setUserImage(user.userImage);
    }
  }, [user?.userImage]);

  // useEffect(() => {
  //   if (user) {
  //     setUserName(user?.userName || '');
  //     setUserImage(user?.userImage || '');
  //   }
  // }, []);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
    });

    if (result.assets && result.assets[0].uri) {
      const selectedImage = result.assets[0];
      console.log('선택한 이미지부터 확인해보장', selectedImage.uri);

      setUserImage(selectedImage.uri ? selectedImage.uri : ''); // uri가 undefined일 경우 빈 문자열로 설정
      // console.log('유저이미지: ', userImage);

      setImageFile({
        uri: selectedImage.uri ? selectedImage.uri : '', // uri가 undefined일 경우 빈 문자열로 설정
        type: selectedImage.type || 'image/jpeg', // 기본 MIME 타입 설정
        name: selectedImage.fileName || 'profile.jpg', // 기본 파일 이름 설정
      });
      // console.log('이미지파일: ', imageFile);
    }
  };

  // imageFile 상태가 업데이트될 때마다 콘솔에 로그 출력
  useEffect(() => {
    if (imageFile && userImage) {
      console.log('이미지파일이 설정됨: ', imageFile.uri);
      console.log('유저이미지 설정됨: ', userImage);
    }
  }, [imageFile, userImage]);

  const handleSave = async () => {
    const formData = new FormData();

    if (imageFile) {
      const image = {
        uri: imageFile.uri,
        type: imageFile.type,
        name: imageFile.name,
      };
      formData.append('image', image as unknown);

      // 개별 속성 확인
      console.log('폼데이타 이미지 URI:', image.uri);
      console.log('폼데이타 이미지 타입:', image.type);
    }

    // nickname을 URL 파라미터로 전달, image를 FormData로 전달
    await updateUser(
      `/user?nickname=${encodeURIComponent(userName)}`,
      formData,
    );

    if (imageFile) {
      // setUserImage(imageFile.uri);
      const updatedUserImageUrl = `${imageFile.uri}?timestamp=${new Date().getTime()}`;
      setUserImage(updatedUserImageUrl);
    }

    setIsEditing(false);
    // await fetchUser(); // 업데이트 후 사용자 정보 다시 불러오기
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
                textAlignVertical: 'center', // 텍스트를 수직 중앙 정렬
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
