type UserProgressDTO = {
  id: number;
  userId: string;
  hearts: number;
  points: number;
  userName: string;
  userImageSrc: string;
};

type UserProgressDTOCreate = Omit<UserProgressDTO, "id">;

export default UserProgressDTO;
export type { UserProgressDTOCreate };