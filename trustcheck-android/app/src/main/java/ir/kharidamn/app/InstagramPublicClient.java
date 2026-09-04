package ir.kharidamn.app;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class InstagramPublicClient {
    private static final Pattern META_TAG = Pattern.compile("<meta\\s+[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern CONTENT_ATTR = Pattern.compile("content=[\\\"']([^\\\"']*)[\\\"']", Pattern.CASE_INSENSITIVE);
    private static final Pattern HANDLE = Pattern.compile("@([A-Za-z0-9._]{1,30})");
    private static final Pattern FOLLOWERS = Pattern.compile("([0-9][0-9.,]*\\s*[KMB]?)\\s+Followers", Pattern.CASE_INSENSITIVE);

    private InstagramPublicClient() {}

    public static ProfileSnapshot lookup(String target) {
        String handle = InputNormalizer.extractHandle(target);
        String url = InputNormalizer.extractInstagramUrl(target);

        try {
            if (handle == null && url != null) {
                String html = fetch(url);
                String title = findMeta(html, "og:title");
                handle = extractHandleFromMeta(title);
            }
            if (handle == null) return new ProfileSnapshot(null, -1, false, "شناسه پیج از ورودی استخراج نشد");

            String profileUrl = "https://www.instagram.com/" + handle + "/";
            String html = fetch(profileUrl);
            String description = findMeta(html, "og:description");
            long followers = parseFollowers(description);
            return new ProfileSnapshot(handle, followers, followers >= 0, followers >= 0 ? "اطلاعات عمومی دریافت شد" : "تعداد فالوور از صفحه عمومی قابل استخراج نبود");
        } catch (Exception e) {
            return new ProfileSnapshot(handle, -1, false, "دسترسی عمومی اینستاگرام در این شبکه ممکن نبود");
        }
    }

    private static String fetch(String urlValue) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(urlValue).openConnection();
        c.setConnectTimeout(6000);
        c.setReadTimeout(6000);
        c.setInstanceFollowRedirects(true);
        c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36");
        c.setRequestProperty("Accept-Language", "en-US,en;q=0.8");
        c.setRequestProperty("Accept", "text/html,application/xhtml+xml");
        int code = c.getResponseCode();
        if (code < 200 || code >= 400) throw new IllegalStateException("HTTP " + code);

        StringBuilder out = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null && out.length() < 1_500_000) out.append(line).append('\n');
        } finally {
            c.disconnect();
        }
        return out.toString();
    }

    private static String findMeta(String html, String property) {
        if (html == null) return null;
        Matcher tags = META_TAG.matcher(html);
        String needle1 = "property=\"" + property.toLowerCase(Locale.US) + "\"";
        String needle2 = "property='" + property.toLowerCase(Locale.US) + "'";
        String name1 = "name=\"" + property.toLowerCase(Locale.US) + "\"";
        while (tags.find()) {
            String tag = tags.group();
            String lower = tag.toLowerCase(Locale.US);
            if (lower.contains(needle1) || lower.contains(needle2) || lower.contains(name1)) {
                Matcher content = CONTENT_ATTR.matcher(tag);
                if (content.find()) return htmlDecode(content.group(1));
            }
        }
        return null;
    }

    private static String extractHandleFromMeta(String meta) {
        if (meta == null) return null;
        Matcher m = HANDLE.matcher(meta);
        return m.find() ? m.group(1) : null;
    }

    private static long parseFollowers(String description) {
        if (description == null) return -1;
        Matcher m = FOLLOWERS.matcher(description);
        if (!m.find()) return -1;
        String raw = m.group(1).trim().toUpperCase(Locale.US).replace(" ", "");
        double multiplier = 1.0;
        if (raw.endsWith("K")) { multiplier = 1_000.0; raw = raw.substring(0, raw.length() - 1); }
        else if (raw.endsWith("M")) { multiplier = 1_000_000.0; raw = raw.substring(0, raw.length() - 1); }
        else if (raw.endsWith("B")) { multiplier = 1_000_000_000.0; raw = raw.substring(0, raw.length() - 1); }
        raw = raw.replace(",", "");
        try { return Math.round(Double.parseDouble(raw) * multiplier); }
        catch (NumberFormatException ignored) { return -1; }
    }

    private static String htmlDecode(String s) {
        return s.replace("&amp;", "&").replace("&quot;", "\"").replace("&#39;", "'");
    }

    public static final class ProfileSnapshot {
        public final String handle;
        public final long followers;
        public final boolean success;
        public final String note;

        public ProfileSnapshot(String handle, long followers, boolean success, String note) {
            this.handle = handle;
            this.followers = followers;
            this.success = success;
            this.note = note;
        }
    }
}
