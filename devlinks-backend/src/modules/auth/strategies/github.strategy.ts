import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';

/** Forma exacta del objeto `_json` que devuelve la API de GitHub */
type GithubJson = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
  bio: string | null;
};

type GithubProfile = Profile & { _json: GithubJson };

export type GithubProfileUser = {
  githubId: string;
  username: string;
  displayName: string;
  email: string | null;
  avatarUrl: string;
  accessToken: string;
};

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') ?? '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') ?? '',
      callbackURL:
        configService.get<string>('GITHUB_CALLBACK_URL') ??
        'http://localhost:3001/auth/github/callback',
      scope: ['read:user', 'user:email'],
    });
  }

  validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): GithubProfileUser {
    const { _json: json } = profile as GithubProfile;

    const email =
      profile.emails?.[0]?.value?.trim() ?? json.email?.trim() ?? null;

    return {
      githubId: String(json.id),
      username: json.login, // siempre presente en GitHub
      displayName: json.name?.trim() || json.login, // fallback al username si no tiene nombre
      email,
      avatarUrl: json.avatar_url, // directo de la API, siempre presente
      accessToken,
    };
  }
}
