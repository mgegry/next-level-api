import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { UserSessionRepository } from '../repositories/user-session.repository';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly userSessionRepository: UserSessionRepository,
  ) {}

  /**
   * Runs every 10 minutes.
   * Adjust as you like. (Hourly also fine.)
   */
  @Cron('*/10 * * * *')
  async cleanupExpiredSessions() {
    // IMPORTANT: advisory lock ensures only ONE instance does cleanup
    // Choose any constant BIGINT. Keep it stable across deployments.
    const LOCK_KEY = 987654321;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Try to acquire lock (non-blocking)
      const [{ locked }] = await queryRunner.query(
        'SELECT pg_try_advisory_lock($1) AS locked',
        [LOCK_KEY],
      );

      if (!locked) {
        // Another instance is already running cleanup
        return;
      }

      const revoked = await this.userSessionRepository.revokeExpiredSessions(
        queryRunner.manager,
      );

      if (revoked > 0) {
        this.logger.log(`Revoked ${revoked} expired sessions`);
      }
    } catch (err: any) {
      this.logger.error(`Cleanup failed: ${err?.message ?? err}`, err?.stack);
    } finally {
      // Always release lock (if acquired)
      try {
        await queryRunner.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY]);
      } catch {
        // ignore unlock errors
      }

      await queryRunner.release();
    }
  }
}
