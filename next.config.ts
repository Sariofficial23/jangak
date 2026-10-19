import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/downloads/jangak-android.apk",
      headers: [
        { key: "Content-Type", value: "application/vnd.android.package-archive" },
        { key: "Content-Disposition", value: 'attachment; filename="jangak-android.apk"' },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    }];
  },
};

export default withNextIntl(nextConfig);
