import type { AuthUser } from "@/types/auth";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  githubUsername: string | null;
  theme: string;
  accentColor: string;
  buttonStyle: string;
  fontFamily: string;
  bgType: string;
  bgColor: string;
  profileLayout: string;
  coverImageUrl: string;
  layout: string;
  title: string | null;
  titleStyle: string;
  titleColor: string;
  pageTextColor: string;
  buttonVariant: string;
  buttonRadius: number;
  buttonShadow: string;
  buttonColor: string;
  buttonTextColor: string;
  altTitleFont: boolean;
  titleFont: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  githubRepo: string;
  stars: number;
  language: string | null;
  pinned: boolean;
  displayOrder: number;
}

export interface PinnedRepoPayload {
  name: string;
  description: string | null;
  url: string;
  githubRepo: string;
  stars: number;
  language: string | null;
}

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  githubUsername: string | null;
  theme: string;
  accentColor: string;
  buttonStyle: string;
  fontFamily: string;
  bgType: string;
  bgColor: string;
  profileLayout: string;
  coverImageUrl: string;
  layout: string;
  title: string | null;
  titleStyle: string;
  titleColor: string;
  pageTextColor: string;
  buttonVariant: string;
  buttonRadius: number;
  buttonShadow: string;
  buttonColor: string;
  buttonTextColor: string;
  altTitleFont: boolean;
  titleFont: string;
  stickers: PlacedSticker[] | null;
  links: {
    id: string;
    title: string;
    url: string;
    icon: string | null;
    previewImage: string | null;
    isPrimary: boolean;
    displayOrder: number;
    layout: "classic" | "featured";
  }[];
  projects: Project[];
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  previewImage: string | null;
  isPrimary: boolean;
  displayOrder: number;
  isActive: boolean;
  layout: "classic" | "featured";
  createdAt: string;
  updatedAt: string;
}

export interface CreateLinkPayload {
  title: string;
  url: string;
  icon?: string;
  previewImage?: string;
  isPrimary?: boolean;
  layout?: "classic" | "featured";
}

export interface UpdateLinkPayload {
  title?: string;
  url?: string;
  icon?: string;
  previewImage?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  layout?: "classic" | "featured";
}

export interface PublicProject {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  githubRepo: string | null;
  stars: number;
  imageUrl: string | null;
  pinned: boolean;
  displayOrder: number;
}

export interface PlacedSticker {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale?: number;
}

export interface UpdateProfilePayload {
  displayName?: string;
  username?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
  theme?: string;
  accentColor?: string;
  buttonStyle?: string;
  fontFamily?: string;
  bgType?: string;
  bgColor?: string;
  profileLayout?: string;
  coverImageUrl?: string;
  layout?: string;
  title?: string | null;
  titleStyle?: string;
  titleColor?: string;
  pageTextColor?: string;
  buttonVariant?: string;
  buttonRadius?: number;
  buttonShadow?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  altTitleFont?: boolean;
  titleFont?: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  updated_at: string;
}

export interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
}

export interface GithubLanguageStat {
  language: string;
  count: number;
  pct: number;
  color: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubStats {
  user: GithubUser;
  topRepos: GithubRepo[];
  topLanguages: GithubLanguageStat[];
  totalRepos: number;
  followers: number;
  contributions: ContributionDay[];
  totalContributions: number;
  fetchedAt: number;
}

export interface ProfileExportJson {
  version: string;
  profile: {
    displayName: string;
    bio: string | null;
    location: string | null;
    avatarUrl: string | null;
    githubUsername: string | null;
    theme: string;
    accentColor: string;
    buttonStyle: string;
    fontFamily: string;
    bgType: string;
    bgColor: string;
    profileLayout: string;
    coverImageUrl: string;
  };
  links: {
    title: string;
    url: string;
    icon: string | null;
    previewImage: string | null;
    isPrimary: boolean;
    displayOrder: number;
    isActive: boolean;
    layout: "classic" | "featured";
  }[];
  stickers: PlacedSticker[];
  projects: {
    title: string;
    description: string | null;
    url: string | null;
    githubRepo: string | null;
    stars: number;
    language: string | null;
    imageUrl: string | null;
    pinned: boolean;
    displayOrder: number;
  }[];
}
