import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { GithubService } from './github.service';
import { GetGithubStatsDto } from './dto/get-github-stats.dto';
import { DisconnectGithubDto } from './dto/disconnect-github.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guards';

@ApiTags('github')
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('stats')
  getStats(@Query() query: GetGithubStatsDto) {
    return this.githubService.getStats(query.username);
  }

  @Get('repos')
  getRepos(@Query() query: GetGithubStatsDto) {
    return this.githubService.getAllRepos(query.username);
  }

  @Post('disconnect')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  disconnect(@Body() body: DisconnectGithubDto) {
    return this.githubService.disconnect(body.username);
  }
}
