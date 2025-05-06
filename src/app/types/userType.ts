type RoleType = {
  id: string;
  name: string;
};

export type UserType = {
  id: string;
  name: string;
  image_url: string;
  username: string;
  email: string;
  role_id?: string;
  role?: RoleType;
};
