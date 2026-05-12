import type { AuthUser } from "@/types/auth";

export type AuthUserResponse = AuthUser;

export type AuthResponse = { user: AuthUser };

export type UserResponse = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
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
  createdAt: string;
};

export type PublicProfileResponse = Omit<UserResponse, "email"> & {
  links: {
    id: string;
    title: string;
    url: string;
    icon: string | null;
    displayOrder: number;
  }[];
};

export type LinkResponse = {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateLinkPayload = {
  title: string;
  url: string;
  icon?: string;
};

export type UpdateLinkPayload = {
  title?: string;
  url?: string;
  icon?: string;
  isActive?: boolean;
};

export type PublicProject = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  githubRepo: string | null;
  stars: number;
  imageUrl: string | null;
  pinned: boolean;
  displayOrder: number;
};

export type UpdateProfilePayload = {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  theme?: string;
  accentColor?: string;
  buttonStyle?: string;
  fontFamily?: string;
  bgType?: string;
  bgColor?: string;
  profileLayout?: string;
  coverImageUrl?: string;
};
