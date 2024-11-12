export type MomentInfo = {
  momentId: string;
  momentTitle: string;
  momentOwner: string;
  createdAt: string;
};

export type Member = {
  userId: string;
  nickname: string;
  imageSrc: string;
};

export type MomentInfoDetail = {
  id: string;
  groupId: string;
  momentPin: string;
  members: Member[];
  momentName: string;
  momentDescription: string;
  momentOwner: Member;
  createdAt: string;
  uploadOption: string;
};

export type MomentAddInfo = {
  momentId: string;
  momentName: string;
  momentDescription: string;
  uploadOption: string;
};
