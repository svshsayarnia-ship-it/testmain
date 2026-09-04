package ir.kharidamn.app;

import android.app.Activity;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import com.google.mlkit.vision.codescanner.GmsBarcodeScanner;
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning;

import java.text.DecimalFormat;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final int BG = Color.rgb(247, 248, 250);
    private static final int TEXT = Color.rgb(28, 31, 36);
    private static final int MUTED = Color.rgb(104, 112, 122);
    private static final int PRIMARY = Color.rgb(18, 122, 92);
    private static final int GREEN_BG = Color.rgb(232, 247, 240);
    private static final int AMBER_BG = Color.rgb(255, 247, 224);
    private static final int RED_BG = Color.rgb(255, 235, 235);
    private static final int BORDER = Color.rgb(224, 228, 233);

    private EditText targetInput;
    private EditText followersInput;
    private EditText avgLikesInput;
    private EditText avgCommentsInput;
    private EditText claimedYearInput;
    private EditText joinYearInput;
    private EditText usernameChangesInput;
    private EditText phoneInput;
    private EditText phoneReportsInput;
    private EditText domainInput;
    private EditText domainAgeInput;
    private CheckBox cardOnlyCheck;
    private CheckBox reusedImagesCheck;
    private CheckBox lowPriceCheck;
    private CheckBox identityVerifiedCheck;
    private LinearLayout advancedPanel;
    private LinearLayout resultBox;
    private TextView lookupNote;
    private Button analyzeButton;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(BG);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        getWindow().getDecorView().setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        setContentView(buildUi());
        handleIncomingShare(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIncomingShare(intent);
    }

    @Override
    protected void onDestroy() {
        executor.shutdownNow();
        super.onDestroy();
    }

    private View buildUi() {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(BG);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(18), dp(24), dp(18), dp(40));
        root.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        scroll.addView(root, new ScrollView.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView title = text("خرید امن", 28, TEXT, true);
        root.addView(title);
        TextView subtitle = text("قبل از واریز پول، پیج فروشنده را بررسی کن", 15, MUTED, false);
        subtitle.setPadding(0, dp(5), 0, dp(18));
        root.addView(subtitle);

        LinearLayout inputCard = card(Color.WHITE);
        inputCard.setPadding(dp(14), dp(14), dp(14), dp(14));
        root.addView(inputCard, marginParams(dp(0), dp(0), dp(0), dp(12)));

        TextView inputLabel = text("لینک، آیدی یا لینک پست اینستاگرام", 14, TEXT, true);
        inputCard.addView(inputLabel);

        targetInput = input("مثلاً @shopname یا لینک پست", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        inputCard.addView(targetInput, marginParams(0, dp(9), 0, dp(10)));

        LinearLayout actions = new LinearLayout(this);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        actions.setGravity(Gravity.CENTER);
        actions.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        inputCard.addView(actions, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        analyzeButton = button("بررسی پیج", PRIMARY, Color.WHITE);
        actions.addView(analyzeButton, weightedParams(1f, 0));
        analyzeButton.setOnClickListener(v -> analyze());

        Button qrButton = button("QR", Color.WHITE, TEXT);
        styleOutline(qrButton);
        actions.addView(qrButton, weightedParams(0.42f, dp(8)));
        qrButton.setOnClickListener(v -> scanQr());

        Button pasteButton = button("چسباندن", Color.WHITE, TEXT);
        styleOutline(pasteButton);
        actions.addView(pasteButton, weightedParams(0.58f, dp(8)));
        pasteButton.setOnClickListener(v -> pasteClipboard());

        lookupNote = text("می‌توانی لینک را مستقیم از Share اینستاگرام هم به «خرید امن» بفرستی.", 12, MUTED, false);
        lookupNote.setPadding(0, dp(10), 0, 0);
        inputCard.addView(lookupNote);

        Button advancedToggle = button("بررسی عمیق  +", Color.WHITE, TEXT);
        styleOutline(advancedToggle);
        root.addView(advancedToggle, marginParams(0, 0, 0, dp(10)));

        advancedPanel = buildAdvancedPanel();
        advancedPanel.setVisibility(View.GONE);
        root.addView(advancedPanel, marginParams(0, 0, 0, dp(12)));
        advancedToggle.setOnClickListener(v -> {
            boolean open = advancedPanel.getVisibility() == View.VISIBLE;
            advancedPanel.setVisibility(open ? View.GONE : View.VISIBLE);
            advancedToggle.setText(open ? "بررسی عمیق  +" : "بستن جزئیات  −");
        });

        resultBox = new LinearLayout(this);
        resultBox.setOrientation(LinearLayout.VERTICAL);
        resultBox.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        root.addView(resultBox);

        LinearLayout info = card(Color.WHITE);
        info.setPadding(dp(14), dp(14), dp(14), dp(14));
        root.addView(info, marginParams(0, dp(12), 0, 0));
        TextView infoTitle = text("این اپ چه چیزی را بررسی می‌کند؟", 14, TEXT, true);
        info.addView(infoTitle);
        info.addView(text("کیفیت تعامل و احتمال مخاطب غیرواقعی، تناقض سابقه ادعایی با زمان ساخت اکانت، تغییر نام کاربری، گزارش‌های مربوط به شماره، قدمت دامنه، کارت‌به‌کارت، قیمت غیرعادی و تصاویر تکراری.", 13, MUTED, false), marginParams(0, dp(7), 0, 0));
        info.addView(text("نتیجه «حکم کلاهبرداری» نیست؛ یک امتیاز ریسک توضیح‌پذیر برای تصمیم بهتر قبل از خرید است.", 12, MUTED, false), marginParams(0, dp(8), 0, 0));

        return scroll;
    }

    private LinearLayout buildAdvancedPanel() {
        LinearLayout panel = card(Color.WHITE);
        panel.setPadding(dp(14), dp(14), dp(14), dp(14));
        panel.addView(text("اطلاعات تکمیلی اختیاری", 15, TEXT, true));
        panel.addView(text("هرچه داده بیشتری داشته باشی، نتیجه قابل اتکاتر است. موردی را که نمی‌دانی خالی بگذار.", 12, MUTED, false), marginParams(0, dp(5), 0, dp(10)));

        followersInput = addField(panel, "تعداد فالوور", "مثلاً 85000", InputType.TYPE_CLASS_NUMBER);
        avgLikesInput = addField(panel, "میانگین لایک ۱۰ پست اخیر", "مثلاً 430", InputType.TYPE_CLASS_NUMBER);
        avgCommentsInput = addField(panel, "میانگین کامنت ۱۰ پست اخیر", "مثلاً 18", InputType.TYPE_CLASS_NUMBER);
        claimedYearInput = addField(panel, "سال شروعی که فروشگاه ادعا می‌کند", "شمسی یا میلادی؛ مثلاً ۱۳۹۸", InputType.TYPE_CLASS_NUMBER);
        joinYearInput = addField(panel, "سال ساخت/Join اکانت", "از About this account؛ مثلاً 2024", InputType.TYPE_CLASS_NUMBER);
        usernameChangesInput = addField(panel, "تعداد تغییر نام کاربری", "مثلاً 4", InputType.TYPE_CLASS_NUMBER);
        phoneInput = addField(panel, "شماره تماس فروشنده", "اختیاری", InputType.TYPE_CLASS_PHONE);
        phoneReportsInput = addField(panel, "تعداد گزارش منفی شناخته‌شده برای شماره", "اگر منبع قابل اعتماد داری", InputType.TYPE_CLASS_NUMBER);
        domainInput = addField(panel, "دامنه فروشگاه", "مثلاً example.ir", InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        domainAgeInput = addField(panel, "سن دامنه به ماه", "اگر خالی باشد، اپ تلاش می‌کند خودکار پیدا کند", InputType.TYPE_CLASS_NUMBER);

        cardOnlyCheck = checkbox("فقط کارت‌به‌کارت قبول می‌کند");
        reusedImagesCheck = checkbox("تصاویر محصول کپی/تکراری به نظر می‌رسند");
        lowPriceCheck = checkbox("قیمت به شکل غیرعادی پایین‌تر از بازار است");
        identityVerifiedCheck = checkbox("هویت کسب‌وکار با یک منبع معتبر تطبیق داده شده");
        panel.addView(cardOnlyCheck);
        panel.addView(reusedImagesCheck);
        panel.addView(lowPriceCheck);
        panel.addView(identityVerifiedCheck);
        return panel;
    }

    private void analyze() {
        String raw = targetInput.getText().toString().trim();
        if (raw.isEmpty() || !InputNormalizer.isInstagramTarget(raw)) {
            Toast.makeText(this, "یک آیدی یا لینک معتبر اینستاگرام وارد کن", Toast.LENGTH_SHORT).show();
            return;
        }

        final RiskEvidence evidence = collectEvidence(raw);
        analyzeButton.setEnabled(false);
        analyzeButton.setText("در حال بررسی…");
        lookupNote.setText("در حال خواندن سیگنال‌های عمومی؛ اگر اینستاگرام اجازه ندهد، نتیجه با داده‌های تکمیلی محاسبه می‌شود.");

        executor.execute(() -> {
            InstagramPublicClient.ProfileSnapshot snapshot = InstagramPublicClient.lookup(raw);
            if ((evidence.handle == null || evidence.handle.isEmpty()) && snapshot.handle != null) evidence.handle = snapshot.handle;
            if (evidence.followers < 0 && snapshot.followers >= 0) {
                evidence.followers = snapshot.followers;
                evidence.followersAutoFetched = true;
            }

            int autoDomainAge = -1;
            if (evidence.domainAgeMonths < 0 && evidence.domain != null && !evidence.domain.isBlank()) {
                autoDomainAge = RdapClient.lookupDomainAgeMonths(evidence.domain);
                if (autoDomainAge >= 0) evidence.domainAgeMonths = autoDomainAge;
            }

            RiskResult result = RiskEngine.analyze(evidence);
            int finalAutoDomainAge = autoDomainAge;
            runOnUiThread(() -> {
                if (evidence.followersAutoFetched && followersInput.getText().toString().trim().isEmpty()) {
                    followersInput.setText(String.valueOf(evidence.followers));
                }
                if (finalAutoDomainAge >= 0 && domainAgeInput.getText().toString().trim().isEmpty()) {
                    domainAgeInput.setText(String.valueOf(finalAutoDomainAge));
                }
                String who = evidence.handle == null || evidence.handle.isEmpty() ? "هدف واردشده" : "@" + evidence.handle;
                lookupNote.setText(who + " • " + snapshot.note + (finalAutoDomainAge >= 0 ? " • سن دامنه خودکار دریافت شد" : ""));
                renderResult(result, evidence);
                analyzeButton.setEnabled(true);
                analyzeButton.setText("بررسی پیج");
            });
        });
    }

    private RiskEvidence collectEvidence(String raw) {
        RiskEvidence e = new RiskEvidence();
        e.target = raw;
        String h = InputNormalizer.extractHandle(raw);
        e.handle = h == null ? "" : h;
        e.followers = parseLong(followersInput.getText().toString());
        e.averageLikes = parseLong(avgLikesInput.getText().toString());
        e.averageComments = parseLong(avgCommentsInput.getText().toString());
        e.claimedStartYear = normalizeYear(parseInt(claimedYearInput.getText().toString()));
        e.observedJoinYear = normalizeYear(parseInt(joinYearInput.getText().toString()));
        e.usernameChanges = parseInt(usernameChangesInput.getText().toString());
        e.phone = phoneInput.getText().toString().trim();
        e.phoneComplaintReports = parseInt(phoneReportsInput.getText().toString());
        e.domain = domainInput.getText().toString().trim();
        e.domainAgeMonths = parseInt(domainAgeInput.getText().toString());
        e.cardTransferOnly = cardOnlyCheck.isChecked();
        e.stolenOrReusedImages = reusedImagesCheck.isChecked();
        e.suspiciouslyLowPrice = lowPriceCheck.isChecked();
        e.identityVerified = identityVerifiedCheck.isChecked();
        return e;
    }

    private void renderResult(RiskResult r, RiskEvidence e) {
        resultBox.removeAllViews();
        int bg;
        int accent;
        if (r.insufficient) {
            bg = Color.WHITE;
            accent = MUTED;
        } else if (r.riskScore >= 65) {
            bg = RED_BG;
            accent = Color.rgb(184, 43, 43);
        } else if (r.riskScore >= 35) {
            bg = AMBER_BG;
            accent = Color.rgb(168, 103, 0);
        } else {
            bg = GREEN_BG;
            accent = Color.rgb(18, 122, 92);
        }

        LinearLayout card = card(bg);
        card.setPadding(dp(16), dp(16), dp(16), dp(16));
        resultBox.addView(card);

        if (r.insufficient) {
            card.addView(text("برای امتیاز قابل اتکا هنوز داده کم است", 18, TEXT, true));
            card.addView(text("اسکن اولیه انجام شد، اما برای تشخیص تعامل مصنوعی یا سابقه هویت حداقل دو سیگنال مستقل لازم داریم. «بررسی عمیق» را باز کن و هر اطلاعاتی که می‌دانی وارد کن.", 13, MUTED, false), marginParams(0, dp(8), 0, 0));
        } else {
            TextView score = text("امتیاز اعتماد: " + toPersianDigits(r.trustScore) + " از ۱۰۰", 22, accent, true);
            card.addView(score);
            card.addView(text("وضعیت: " + r.level + "  •  اطمینان تحلیل: " + toPersianDigits(r.confidence) + "٪", 13, TEXT, false), marginParams(0, dp(6), 0, 0));
        }

        if (!r.reasons.isEmpty()) {
            card.addView(text("نشانه‌های ریسک", 14, TEXT, true), marginParams(0, dp(14), 0, dp(3)));
            for (String reason : r.reasons) card.addView(bullet(reason, accent));
        }
        if (!r.positives.isEmpty()) {
            card.addView(text("نشانه‌های مثبت / خنثی", 14, TEXT, true), marginParams(0, dp(12), 0, dp(3)));
            for (String positive : r.positives) card.addView(bullet(positive, PRIMARY));
        }

        if (e.followers > 0 && e.averageLikes >= 0 && e.averageComments >= 0) {
            double rate = ((double) e.averageLikes + e.averageComments) * 100.0 / e.followers;
            DecimalFormat df = new DecimalFormat("0.00");
            card.addView(text("نرخ تعامل محاسبه‌شده: " + toPersianDigits(df.format(rate)) + "٪", 12, MUTED, false), marginParams(0, dp(10), 0, 0));
        }

        card.addView(text("این نتیجه یک ارزیابی ریسک است، نه اتهام یا حکم قطعی درباره فروشنده.", 11, MUTED, false), marginParams(0, dp(14), 0, 0));
    }

    private void scanQr() {
        GmsBarcodeScanner scanner = GmsBarcodeScanning.getClient(this);
        scanner.startScan()
                .addOnSuccessListener(barcode -> {
                    String value = barcode.getRawValue();
                    if (value == null || value.trim().isEmpty()) {
                        Toast.makeText(this, "QR خوانده شد ولی متن قابل استفاده نداشت", Toast.LENGTH_SHORT).show();
                        return;
                    }
                    targetInput.setText(value.trim());
                    targetInput.setSelection(targetInput.length());
                    lookupNote.setText("QR خوانده شد؛ برای ادامه «بررسی پیج» را بزن.");
                })
                .addOnFailureListener(e -> Toast.makeText(this, "اسکن QR در این دستگاه انجام نشد", Toast.LENGTH_SHORT).show());
    }

    private void pasteClipboard() {
        ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        if (cm == null || !cm.hasPrimaryClip() || cm.getPrimaryClip() == null || cm.getPrimaryClip().getItemCount() == 0) {
            Toast.makeText(this, "چیزی در کلیپ‌بورد نیست", Toast.LENGTH_SHORT).show();
            return;
        }
        CharSequence text = cm.getPrimaryClip().getItemAt(0).coerceToText(this);
        targetInput.setText(text == null ? "" : text.toString());
    }

    private void handleIncomingShare(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
        String shared = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (shared != null && !shared.trim().isEmpty()) {
            targetInput.setText(shared.trim());
            lookupNote.setText("لینک از Share دریافت شد؛ حالا «بررسی پیج» را بزن.");
        }
    }

    private EditText addField(LinearLayout parent, String label, String hint, int inputType) {
        parent.addView(text(label, 12, TEXT, true), marginParams(0, dp(8), 0, dp(4)));
        EditText field = input(hint, inputType);
        parent.addView(field);
        return field;
    }

    private EditText input(String hint, int inputType) {
        EditText e = new EditText(this);
        e.setHint(hint);
        e.setHintTextColor(Color.rgb(154, 160, 168));
        e.setTextColor(TEXT);
        e.setTextSize(14);
        e.setSingleLine(true);
        e.setInputType(inputType);
        e.setGravity(Gravity.CENTER_VERTICAL | Gravity.RIGHT);
        e.setPadding(dp(12), dp(8), dp(12), dp(8));
        e.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        GradientDrawable bg = rounded(Color.rgb(250, 251, 252), BORDER, 12);
        e.setBackground(bg);
        e.setMinHeight(dp(48));
        return e;
    }

    private CheckBox checkbox(String label) {
        CheckBox c = new CheckBox(this);
        c.setText(label);
        c.setTextColor(TEXT);
        c.setTextSize(13);
        c.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
        c.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        c.setPadding(0, dp(3), 0, dp(3));
        return c;
    }

    private TextView bullet(String value, int accent) {
        TextView t = text("•  " + value, 13, TEXT, false);
        t.setPadding(0, dp(5), 0, 0);
        t.setGravity(Gravity.RIGHT);
        return t;
    }

    private TextView text(String value, int sp, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextSize(sp);
        t.setTextColor(color);
        t.setGravity(Gravity.RIGHT);
        t.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        t.setLineSpacing(0, 1.15f);
        if (bold) t.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        return t;
    }

    private Button button(String label, int bgColor, int textColor) {
        Button b = new Button(this);
        b.setText(label);
        b.setTextColor(textColor);
        b.setTextSize(13);
        b.setAllCaps(false);
        b.setMinHeight(dp(48));
        b.setPadding(dp(8), 0, dp(8), 0);
        b.setBackground(rounded(bgColor, bgColor, 12));
        return b;
    }

    private void styleOutline(Button b) {
        b.setBackground(rounded(Color.WHITE, BORDER, 12));
    }

    private LinearLayout card(int color) {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        l.setLayoutDirection(View.LAYOUT_DIRECTION_RTL);
        l.setBackground(rounded(color, BORDER, 16));
        return l;
    }

    private GradientDrawable rounded(int fill, int stroke, int radiusDp) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(fill);
        d.setCornerRadius(dp(radiusDp));
        d.setStroke(dp(1), stroke);
        return d;
    }

    private LinearLayout.LayoutParams marginParams(int left, int top, int right, int bottom) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        p.setMargins(left, top, right, bottom);
        return p;
    }

    private LinearLayout.LayoutParams weightedParams(float weight, int rightMargin) {
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, weight);
        p.setMargins(0, 0, rightMargin, 0);
        return p;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    private long parseLong(String raw) {
        if (raw == null || raw.trim().isEmpty()) return -1;
        try { return Long.parseLong(raw.trim().replace(",", "")); }
        catch (Exception ignored) { return -1; }
    }

    private int parseInt(String raw) {
        if (raw == null || raw.trim().isEmpty()) return -1;
        try { return Integer.parseInt(raw.trim()); }
        catch (Exception ignored) { return -1; }
    }

    private int normalizeYear(int year) {
        if (year >= 1300 && year <= 1500) return year + 621;
        return year;
    }

    private String toPersianDigits(Object value) {
        String s = String.valueOf(value);
        char[] en = {'0','1','2','3','4','5','6','7','8','9'};
        char[] fa = {'۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'};
        for (int i = 0; i < en.length; i++) s = s.replace(en[i], fa[i]);
        return s;
    }
}
