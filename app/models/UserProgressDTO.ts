type UserProgressDTO = {
  id: number;
  userId: string;
  hearts: number;
  points: number;
  tickets: number;
  userName: string;
  userImageSrc: string;
  userEmail: string;
};

type UserProgressDTOCreate = Omit<UserProgressDTO, "id">;

export default UserProgressDTO;
export type { UserProgressDTOCreate };
