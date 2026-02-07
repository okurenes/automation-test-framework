import { Logger } from './logger';

export interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: string;
  environment: string;
  branch?: string;
  commitSha?: string;
  reportUrl?: string;
}

export class SlackNotifier {
  private readonly webhookUrl: string;
  private readonly channel: string;
  private readonly logger = new Logger('SlackNotifier');

  constructor(webhookUrl?: string, channel?: string) {
    this.webhookUrl = webhookUrl || process.env.SLACK_WEBHOOK_URL || '';
    this.channel = channel || process.env.SLACK_CHANNEL || '#qa-automation';
  }

  isConfigured(): boolean {
    return this.webhookUrl.length > 0;
  }

  async sendTestResults(summary: TestSummary): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Slack webhook URL not configured. Skipping notification.');
      return;
    }

    const status = summary.failed > 0 ? 'FAILED' : 'PASSED';
    const emoji = summary.failed > 0 ? ':x:' : ':white_check_mark:';
    const color = summary.failed > 0 ? '#FF0000' : '#36A64F';

    const payload = {
      channel: this.channel,
      username: 'QA Automation Bot',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          color,
          title: `${emoji} Test Suite ${status}`,
          fields: [
            {
              title: 'Environment',
              value: summary.environment,
              short: true,
            },
            {
              title: 'Duration',
              value: summary.duration,
              short: true,
            },
            {
              title: 'Total Tests',
              value: String(summary.totalTests),
              short: true,
            },
            {
              title: 'Passed',
              value: `:white_check_mark: ${summary.passed}`,
              short: true,
            },
            {
              title: 'Failed',
              value: `:x: ${summary.failed}`,
              short: true,
            },
            {
              title: 'Skipped',
              value: `:fast_forward: ${summary.skipped}`,
              short: true,
            },
            ...(summary.flaky > 0
              ? [
                  {
                    title: 'Flaky',
                    value: `:warning: ${summary.flaky}`,
                    short: true,
                  },
                ]
              : []),
            ...(summary.branch
              ? [
                  {
                    title: 'Branch',
                    value: summary.branch,
                    short: true,
                  },
                ]
              : []),
          ],
          ...(summary.reportUrl
            ? {
                actions: [
                  {
                    type: 'button',
                    text: 'View Report',
                    url: summary.reportUrl,
                  },
                ],
              }
            : {}),
          footer: 'Mobile Automation Test Framework',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        this.logger.info('Slack notification sent successfully');
      } else {
        this.logger.error(`Slack notification failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send Slack notification: ${error}`);
    }
  }

  async sendCustomMessage(message: string, color = '#439FE0'): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Slack webhook URL not configured. Skipping notification.');
      return;
    }

    const payload = {
      channel: this.channel,
      username: 'QA Automation Bot',
      icon_emoji: ':robot_face:',
      attachments: [
        {
          color,
          text: message,
          footer: 'Mobile Automation Test Framework',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    try {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error(`Failed to send Slack message: ${error}`);
    }
  }
}
