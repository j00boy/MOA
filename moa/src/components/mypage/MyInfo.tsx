import React, {useEffect} from 'react';
import styled, {css, useTheme} from 'styled-components/native';
import {IconButton} from '../common/button/IconButton';
import {useUserStore} from '../../stores/userStores';

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
const IconButtonStyled = styled.View`
  position: absolute;
  top: 8px;
  right: 8px;
`;

const MyProfile = styled.Image`
  border-radius: 50px;
  border: 1px solid ${(props) => props.theme.colors.lightgray};
  width: 70px;
  height: 70px;
  background-color: ${(props) => props.theme.colors.maindarkorange};
`;

const MyInfo = () => {
  const theme = useTheme();
  const {fetchUser, user, fetchUserGroups, userGroups} = useUserStore();
  useEffect(() => {
    fetchUser();
    fetchUserGroups();
  }, [fetchUser]);
  // const DummyData = [
  //   {
  //     name: '에브리데이',
  //     group: 3, // 내 그룹
  //     totalDownloads: 1500, // 누적 다운로드 수
  //   },
  //   {
  //     name: '이영희',
  //     group: 5, // 내 그룹
  //     totalDownloads: 2300, // 누적 다운로드 수
  //   },
  //   {
  //     name: '김철수',
  //     group: 1, // 내 그룹
  //     totalDownloads: 500, // 누적 다운로드 수
  //   },
  // ];

  return (
    <UserInfo>
      <TextInfo>
        <Texts variant="subtitle">
          <Texts variant="subtitle" color={theme.colors.maindarkorange}>
            {/* {DummyData[0].name} */}
            {user?.userName}
          </Texts>
          님 안녕하세요!
        </Texts>
        {/* <Texts variant="body">내 그룹 | {DummyData[0].group} 개</Texts> */}
        <Texts variant="body">내 그룹 | {userGroups?.length} 개</Texts>
        <Texts variant="body">누적 업로드 사진 수 | 장</Texts>
      </TextInfo>
      <MyProfile source={{uri: user?.userImage}} />
      <IconButtonStyled>
        <IconButton
          backcolor="white"
          iconName="edit"
          iconSet="Material"
          onPress={() => console.log('편집 아이콘 버튼 눌렀음')}
        />
      </IconButtonStyled>
    </UserInfo>
  );
};

export default MyInfo;
