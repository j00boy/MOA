// src/components/common/button/ButtonDemo.tsx
import React from 'react';
import {View} from 'react-native';
import {IconButton} from './IconButton';
import {TextButton} from './TextButton';

const ButtonTest = () => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      {/* 텍스트 버튼 예시 */}
      <TextButton
        backcolor="maindarkorange"
        text="그룹 만들기"
        size="large"
        onPress={() => console.log('그룹 만들기 버튼')}
      />
      <TextButton
        backcolor="white"
        text="다운로드"
        iconName="download"
        iconSet="Feather"
        size="small"
        onPress={() => console.log('다운로드 버튼')}
      />
      <TextButton
        backcolor="mainlightorange"
        text="등록하기"
        iconName="plus"
        iconSet="Feather"
        size="small"
        onPress={() => console.log('등록하기 버튼')}
      />
      <TextButton
        backcolor="mainlightyellow"
        text="나의 순간"
        size="medium"
        onPress={() => console.log('나의 순간 ')}
      />
      <TextButton
        backcolor="mainlightyellow"
        text="나의 그룹"
        size="medium"
        onPress={() => console.log('나의 그룹 ')}
      />

      {/* 아이콘 버튼 예시  */}
      <IconButton
        backcolor="white"
        iconName="edit"
        iconSet="Material"
        onPress={() => console.log('편집 아이콘 버튼 눌렀음')}
      ></IconButton>
      <IconButton
        backcolor="maindarkorange"
        iconSet="Feather"
        iconName="external-link"
        onPress={() => console.log('공유하기 아이콘 버튼 눌렀음')}
      />
      <IconButton
        backcolor="white"
        iconSet="Feather"
        iconName="external-link"
        onPress={() => console.log('공유하기 아이콘 버튼 눌렀음')}
      />
      <IconButton
        backcolor="white"
        iconSet="Feather"
        iconName="more-vertical"
        onPress={() => console.log('점점점 아이콘 ')}
      ></IconButton>
    </View>
  );
};

export default ButtonTest;
