import {Member} from './moment';

export type GroupInfo = {
  groupId: string;
  groupName: string;
  groupColor: string;
  groupIcon: string;
  groupTotalImages: number;
  memberCount: number;
};

export type GroupImages = {
  thumbImgs: Record<string, string[]>;
};

export type GroupInfoDetail = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  groupColor: string;
  groupIcon: string;
  groupPin: string;
  members: Member[];
  groupOwner: Member;
  createdAt: string;
  images: GroupImages;
};

export type GroupAddInfo = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  groupColor: string;
  groupIcon: string;
};
