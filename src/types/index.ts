export enum Status {
  DISABLE = 0,
  ENABLE = 1,
}

export type Family = {
  id?: string;
  name?: string;
  created_date?: Date | string;
};

export type Invitation = {
  id?: string;
  family?: Family;
  family_name?: string;
  father_name?: string;
  mother_name?: string;
  first_child_name?: string;
  second_child_name?: string;
  accepted?: Status;
  created_date?: Date | string;
};

export type SystemUser = {
  id?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  status?: Status;
  token?: string;
};
