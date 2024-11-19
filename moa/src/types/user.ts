import {ImageSourcePropType} from 'react-native';

export type Profile = {
  userId: number;
  userName: string;
  userImage: ImageSourcePropType;
};
