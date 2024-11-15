import {Member} from './moment';

export type GroupInfo = {
  groupId: string;
  groupName: string;
  groupColor: string;
  groupIcon: string;
  groupTotalImages: number;
  memberCount: number;
};

export type Group = {
  groupId: string;
  groupPin: string;
  groupName: string;
  groupDescription: string;
  groupIcon: string;
  groupColor: string;
  groupTotalImages: string;
  createdAt: string;
};

export type GroupImages = {
  thumbImgs: Record<string, string[]>;
};

export type GroupInfoDetail = {
  group: Group;
  users: Member[];
  groupOwner: Member;
  images: GroupImages;
  expiredAt: Record<string, string>;
};

export type GroupAddInfo = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  groupColor: string;
  groupIcon: string;
};
