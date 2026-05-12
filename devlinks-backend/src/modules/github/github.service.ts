import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';

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

interface GithubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
}

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface GithubLanguageStat {
  language: string;
  count: number;
  pct: number;
  color: string;
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

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Astro: '#000000',
};

const CACHE_TTL = 3600;
const GH_BASE = 'https://api.github.com';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name);

  constructor(private readonly redis: RedisService) {}

  async getStats(username: string): Promise<GithubStats> {
    const key = this.cacheKey(username);
    const cached = await this.redis.getClient().get(key);

    if (cached) {
      this.logger.debug(`Cache hit: ${key}`);
      return JSON.parse(cached) as GithubStats;
    }

    this.logger.debug(`Cache miss: ${key} — fetching from GitHub`);
    const stats = await this.fetchFromGithub(username);
    await this.redis
      .getClient()
      .set(key, JSON.stringify(stats), 'EX', CACHE_TTL);
    return stats;
  }

  async getAllRepos(username: string): Promise<GithubRepo[]> {
    const key = `github:repos:${username.toLowerCase()}`;
    const cached = await this.redis.getClient().get(key);

    if (cached) {
      this.logger.debug(`Cache hit: ${key}`);
      return JSON.parse(cached) as GithubRepo[];
    }

    this.logger.debug(`Cache miss: ${key} — fetching from GitHub`);
    const repos = await this.ghFetch<GithubRepo[]>(
      `/users/${username}/repos?per_page=100&sort=updated`,
    );
    await this.redis
      .getClient()
      .set(key, JSON.stringify(repos), 'EX', CACHE_TTL);
    return repos;
  }

  async disconnect(username: string): Promise<void> {
    const key = this.cacheKey(username);
    const reposKey = `github:repos:${username.toLowerCase()}`;
    await Promise.all([
      this.redis.getClient().del(key),
      this.redis.getClient().del(reposKey),
    ]);
    this.logger.debug(`Cache cleared: ${key}`);
  }

  private cacheKey(username: string): string {
    return `github:stats:${username.toLowerCase()}`;
  }

  private async ghFetch<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${GH_BASE}${path}`, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API ${path} → ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
  }

  private async fetchContributions(
    username: string,
  ): Promise<ContributionDay[]> {
    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      );
      if (!res.ok) return [];
      const data = (await res.json()) as {
        contributions: ContributionDay[];
        total: Record<string, number>;
      };
      return data.contributions ?? [];
    } catch {
      return [];
    }
  }

  private async fetchFromGithub(username: string): Promise<GithubStats> {
    const [user, repos, contributions] = await Promise.all([
      this.ghFetch<GithubUser>(`/users/${username}`),
      this.ghFetch<GithubRepo[]>(
        `/users/${username}/repos?per_page=100&sort=pushed`,
      ),
      this.fetchContributions(username),
    ]);

    const sorted = [...repos].sort(
      (a, b) => b.stargazers_count - a.stargazers_count,
    );
    const hasStars = sorted.some((r) => r.stargazers_count > 0);
    const topRepos = hasStars ? sorted.slice(0, 3) : repos.slice(0, 3);

    const langCount: Record<string, number> = {};
    for (const repo of repos) {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] ?? 0) + 1;
      }
    }
    const total = Object.values(langCount).reduce((s, v) => s + v, 0);
    const topLanguages: GithubLanguageStat[] = Object.entries(langCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([language, count]) => ({
        language,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
        color: LANGUAGE_COLORS[language] ?? '#94a3b8',
      }));

    const totalContributions = contributions.reduce((s, d) => s + d.count, 0);

    return {
      user,
      topRepos,
      topLanguages,
      totalRepos: repos.length,
      followers: user.followers,
      contributions,
      totalContributions,
      fetchedAt: Date.now(),
    };
  }
}
