import { Gender } from './users.enum';

export interface IUser {
  username: string;
  name: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  email: string;
  gender?: Gender;
}

export interface IGithubUserInfo extends IGithubUserInfoNotFound {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  name: string;
  company: string | null;
  blog: string;
  location: string;
  email: string;
  hireable: boolean | null;
  bio: string;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}

interface IGithubUserInfoNotFound {
  message?: string;
  documentation_url?: string;
  status?: string;
}

export interface IGithubUsernamesObject {
  total_count: number;
  incomplete_results: boolean;
  items: IGithubUsernamesItems[];
}

export interface IGithubUsernamesItems {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  score: number;
}

export interface IUpdateUser {
  username?: string;
  name?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  email?: string;
  gender?: Gender;
}

export interface IGetUserResponse {
  username: string;
  name?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  email?: string;
  gender: Gender;
  qtdFollowers: number;
  qtdFollowing: number;
  qtdRepos: number;
  publicUrl: string;
}

export interface IUserEntity {
  id: bigint;
  username: string;
  name: string;
  lastName: string;
  profileImageUrl: string;
  bio: string;
  email: string;
  gender: Gender;
}
