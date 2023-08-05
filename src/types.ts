export interface UsersData {
  info: {
    seed: string;
    page: number;
    results: number;
    version: string;
  };
  results: UserInfo[];
}

export interface UserInfo {
  gender: 'female' | 'male';
  name: {
    title: string;
    first: string;
    last: string;
  };
  picture: {
    medium: string;
    large: string;
  };
}
