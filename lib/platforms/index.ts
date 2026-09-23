import type { ContentItem } from "../types";

export type PublishResult = { ok: true } | { ok: false; reason: string };

export interface PlatformAdapter {
  /**
   * Đăng nội dung thật lên nền tảng. Adapter mặc định trả về ok:false vì
   * chưa có API key / app chưa được nền tảng duyệt — đây là hành vi AN TOÀN
   * mặc định, tránh gọi API khi chưa sẵn sàng. Cắắm API thật vào đây khi
   * TikTok Content Posting API / YouTube Data API v3 đã được cấp quyền.
   */
  publish(item: ContentItem): Promise<PublishResult>;
}

class NotConfiguredAdapter implements PlatformAdapter {
  constructor(private platformName: string) {}
  async publish(): Promise<PublishResult> {
    return {
      ok: false,
      reason: `${this.platformName}: chưa cấu hình API key / app chưa được duyệt. Đăng thủ công hoặc bổ sung adapter thật trong lib/platforms/.`,
    };
  }
}

const adapters: Record<string, PlatformAdapter> = {
  tiktok: new NotConfiguredAdapter("TikTok"),
  youtube: new NotConfiguredAdapter("YouTube"),
  facebook: new NotConfiguredAdapter("Facebook"),
};

export function getAdapter(platform: string): PlatformAdapter {
  return adapters[platform] ?? new NotConfiguredAdapter(platform);
}
