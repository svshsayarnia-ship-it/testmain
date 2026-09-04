package ir.kharidamn.app;

import java.net.URI;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class InputNormalizer {
    private static final Pattern INSTAGRAM_URL = Pattern.compile("https?://(?:www\\.)?instagram\\.com/[^\\s]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern HANDLE = Pattern.compile("^[A-Za-z0-9._]{1,30}$");

    private InputNormalizer() {}

    public static String extractInstagramUrl(String raw) {
        if (raw == null) return null;
        Matcher m = INSTAGRAM_URL.matcher(raw.trim());
        return m.find() ? trimPunctuation(m.group()) : null;
    }

    public static String extractHandle(String raw) {
        if (raw == null) return null;
        String value = raw.trim();
        if (value.startsWith("@")) value = value.substring(1);
        if (HANDLE.matcher(value).matches()) return value;

        String url = extractInstagramUrl(value);
        if (url == null) return null;
        try {
            URI uri = URI.create(url);
            String path = uri.getPath();
            if (path == null) return null;
            String[] parts = path.split("/");
            String first = null;
            for (String part : parts) {
                if (!part.isBlank()) {
                    first = part;
                    break;
                }
            }
            if (first == null) return null;
            String low = first.toLowerCase(Locale.US);
            if (low.equals("p") || low.equals("reel") || low.equals("reels") || low.equals("tv") || low.equals("stories") || low.equals("share")) {
                return null;
            }
            return HANDLE.matcher(first).matches() ? first : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    public static boolean isInstagramTarget(String raw) {
        return extractHandle(raw) != null || extractInstagramUrl(raw) != null;
    }

    private static String trimPunctuation(String value) {
        while (value.endsWith(",") || value.endsWith(".") || value.endsWith(")") || value.endsWith("]")) {
            value = value.substring(0, value.length() - 1);
        }
        return value;
    }
}
