import { type TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

export class AllureHelper {
  private readonly testInfo: TestInfo;

  constructor(testInfo: TestInfo) {
    this.testInfo = testInfo;
  }

  addSeverity(severity: Severity): void {
    this.testInfo.annotations.push({ type: 'severity', description: severity });
  }

  addEpic(epic: string): void {
    this.testInfo.annotations.push({ type: 'epic', description: epic });
  }

  addFeature(feature: string): void {
    this.testInfo.annotations.push({ type: 'feature', description: feature });
  }

  addStory(story: string): void {
    this.testInfo.annotations.push({ type: 'story', description: story });
  }

  addOwner(owner: string): void {
    this.testInfo.annotations.push({ type: 'owner', description: owner });
  }

  addTag(tag: string): void {
    this.testInfo.annotations.push({ type: 'tag', description: tag });
  }

  addLink(url: string, name?: string): void {
    this.testInfo.annotations.push({ type: 'link', description: `${name || url}|${url}` });
  }

  addIssue(issueId: string): void {
    this.testInfo.annotations.push({ type: 'issue', description: issueId });
  }

  addTmsLink(tmsId: string): void {
    this.testInfo.annotations.push({ type: 'tms', description: tmsId });
  }

  addDescription(description: string): void {
    this.testInfo.annotations.push({ type: 'description', description });
  }

  async addScreenshot(name: string, body: Buffer): Promise<void> {
    await this.testInfo.attach(name, {
      body,
      contentType: 'image/png',
    });
  }

  async addTextAttachment(name: string, content: string): Promise<void> {
    await this.testInfo.attach(name, {
      body: content,
      contentType: 'text/plain',
    });
  }

  async addJsonAttachment(name: string, data: unknown): Promise<void> {
    await this.testInfo.attach(name, {
      body: JSON.stringify(data, null, 2),
      contentType: 'application/json',
    });
  }

  async addFileAttachment(name: string, filePath: string): Promise<void> {
    const content = fs.readFileSync(path.resolve(filePath));
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.html': 'text/html',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
    };
    await this.testInfo.attach(name, {
      body: content,
      contentType: contentTypeMap[ext] || 'application/octet-stream',
    });
  }
}
