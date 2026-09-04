package ir.kharidamn.app;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class RdapClient {
    private static final Pattern DATE = Pattern.compile("\\\"eventDate\\\"\\s*:\\s*\\\"(\\d{4})-(\\d{2})-");

    private RdapClient() {}

    public static int lookupDomainAgeMonths(String rawDomain) {
        String domain = normalizeDomain(rawDomain);
        if (domain == null) return -1;
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL("https://rdap.org/domain/" + domain).openConnection();
            c.setConnectTimeout(6000);
            c.setReadTimeout(6000);
            c.setRequestProperty("Accept", "application/rdap+json,application/json");
            c.setRequestProperty("User-Agent", "KharidAmn/0.1 Android");
            int code = c.getResponseCode();
            if (code < 200 || code >= 400) return -1;
            StringBuilder json = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null && json.length() < 800_000) json.append(line);
            }
            String text = json.toString();
            int idx = text.toLowerCase(Locale.US).indexOf("\"eventaction\":\"registration\"");
            if (idx < 0) idx = text.toLowerCase(Locale.US).indexOf("\"eventaction\" : \"registration\"");
            if (idx < 0) idx = text.toLowerCase(Locale.US).indexOf("registration");
            if (idx < 0) return -1;
            int start = Math.max(0, idx - 300);
            int end = Math.min(text.length(), idx + 500);
            Matcher m = DATE.matcher(text.substring(start, end));
            if (!m.find()) return -1;
            int year = Integer.parseInt(m.group(1));
            int month = Integer.parseInt(m.group(2));
            Calendar now = Calendar.getInstance();
            int months = (now.get(Calendar.YEAR) - year) * 12 + ((now.get(Calendar.MONTH) + 1) - month);
            return Math.max(0, months);
        } catch (Exception ignored) {
            return -1;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    public static String normalizeDomain(String raw) {
        if (raw == null) return null;
        String d = raw.trim().toLowerCase(Locale.US);
        d = d.replaceFirst("^https?://", "");
        d = d.replaceFirst("^www\\.", "");
        int slash = d.indexOf('/');
        if (slash >= 0) d = d.substring(0, slash);
        int colon = d.indexOf(':');
        if (colon >= 0) d = d.substring(0, colon);
        if (!d.matches("[a-z0-9.-]+\\.[a-z]{2,63}")) return null;
        return d;
    }
}
