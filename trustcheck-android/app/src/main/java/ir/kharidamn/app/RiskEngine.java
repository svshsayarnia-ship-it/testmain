package ir.kharidamn.app;

import java.util.Locale;

public final class RiskEngine {
    private RiskEngine() {}

    public static RiskResult analyze(RiskEvidence e) {
        RiskResult r = new RiskResult();
        int risk = 0;
        int signals = 0;

        if (e.followers >= 0 && e.followersAutoFetched) {
            r.positives.add("تعداد فالوورها از صفحه عمومی اینستاگرام دریافت شد؛ این عدد به‌تنهایی نشانه اعتبار یا تقلب نیست.");
        }

        if (e.followers > 0 && e.averageLikes >= 0 && e.averageComments >= 0) {
            signals++;
            double engagement = ((double) e.averageLikes + e.averageComments) * 100.0 / e.followers;
            String formatted = String.format(Locale.US, "%.2f", engagement);

            if (e.followers >= 10000) {
                if (engagement < 0.15) {
                    risk += 22;
                    r.reasons.add("تعامل فقط " + formatted + "٪ است؛ نسبت به تعداد فالوور بسیار پایین و نشانه مخاطب کم‌کیفیت/غیرفعال یا رشد غیرطبیعی است.");
                } else if (engagement < 0.40) {
                    risk += 15;
                    r.reasons.add("تعامل " + formatted + "٪ است و برای این اندازه پیج پایین ارزیابی شد.");
                } else if (engagement < 0.80) {
                    risk += 8;
                    r.reasons.add("تعامل " + formatted + "٪ کمی پایین است؛ برای نتیجه قطعی باید کیفیت کامنت‌ها و رشد پیج هم بررسی شود.");
                } else {
                    r.positives.add("نسبت تعامل به فالوور در محدوده غیرمشکوک اولیه قرار دارد (" + formatted + "٪).");
                }
            } else if (e.followers >= 1000) {
                if (engagement < 0.30) {
                    risk += 15;
                    r.reasons.add("تعامل " + formatted + "٪ برای این اندازه پیج بسیار پایین است.");
                } else if (engagement < 0.80) {
                    risk += 7;
                    r.reasons.add("تعامل " + formatted + "٪ پایین است و نیاز به بررسی بیشتر دارد.");
                } else {
                    r.positives.add("تعامل اولیه با تعداد فالوورها هم‌خوانی قابل قبول دارد (" + formatted + "٪).");
                }
            } else {
                r.positives.add("نرخ تعامل محاسبه شد (" + formatted + "٪)، اما برای پیج کوچک وزن کمی در امتیاز دارد.");
            }

            if (e.averageLikes > 0 && e.averageComments > e.averageLikes * 0.8) {
                risk += 5;
                r.reasons.add("نسبت کامنت به لایک غیرعادی است؛ احتمال تعامل سازمان‌یافته یا الگوی مصنوعی نیاز به بررسی دارد.");
            }
        }

        if (e.claimedStartYear > 0 && e.observedJoinYear > 0) {
            signals++;
            int gap = e.observedJoinYear - e.claimedStartYear;
            if (gap >= 3) {
                risk += 22;
                r.reasons.add("پیج ادعای شروع از " + e.claimedStartYear + " دارد اما سابقه مشاهده‌شده اکانت از " + e.observedJoinYear + " است؛ تناقض زمانی جدی دیده شد.");
            } else if (gap >= 1) {
                risk += 10;
                r.reasons.add("بین سابقه ادعایی فروشگاه و زمان مشاهده‌شده اکانت اختلاف وجود دارد.");
            } else {
                r.positives.add("سابقه ادعایی فروشگاه با زمان مشاهده‌شده اکانت تناقض واضحی ندارد.");
            }
        }

        if (e.usernameChanges >= 0) {
            signals++;
            if (e.usernameChanges >= 5) {
                risk += 12;
                r.reasons.add("نام کاربری حداقل " + e.usernameChanges + " بار تغییر کرده؛ تغییر هویت زیاد نیازمند بررسی است.");
            } else if (e.usernameChanges >= 3) {
                risk += 7;
                r.reasons.add("تغییر نام کاربری چندباره مشاهده شده است.");
            } else if (e.usernameChanges == 0) {
                r.positives.add("تغییر نام کاربری گزارش نشده است.");
            }
        }

        if (e.phoneComplaintReports >= 0) {
            signals++;
            if (e.phoneComplaintReports >= 5) {
                risk += 28;
                r.reasons.add("برای شماره/هویت واردشده " + e.phoneComplaintReports + " گزارش منفی ثبت شده؛ این سیگنال وزن بالایی دارد.");
            } else if (e.phoneComplaintReports >= 2) {
                risk += 18;
                r.reasons.add("چند گزارش منفی برای شماره/هویت واردشده وجود دارد.");
            } else if (e.phoneComplaintReports == 1) {
                risk += 8;
                r.reasons.add("یک گزارش منفی وجود دارد؛ یک گزارش به‌تنهایی اثبات کلاهبرداری نیست.");
            } else {
                r.positives.add("در داده واردشده گزارش منفی برای شماره ثبت نشده است.");
            }
        }

        if (e.domainAgeMonths >= 0) {
            signals++;
            if (e.domainAgeMonths <= 2) {
                risk += 8;
                r.reasons.add("دامنه بسیار جدید است (حدود " + e.domainAgeMonths + " ماه). این فقط یک سیگنال کمکی است.");
            } else if (e.domainAgeMonths <= 6) {
                risk += 4;
                r.reasons.add("دامنه کمتر از ۶ ماه قدمت دارد؛ برای فروشگاهی با ادعای سابقه طولانی نیاز به بررسی بیشتر است.");
            } else if (e.domainAgeMonths >= 24) {
                r.positives.add("دامنه بیش از دو سال قدمت دارد؛ این یک نشانه مثبت کمکی است، نه تضمین اعتبار.");
            }
        }

        if (e.cardTransferOnly) {
            signals++;
            risk += 10;
            r.reasons.add("پرداخت فقط کارت‌به‌کارت اعلام شده؛ امکان پیگیری و حمایت خرید معمولاً کمتر است.");
        }
        if (e.stolenOrReusedImages) {
            signals++;
            risk += 12;
            r.reasons.add("تصاویر محصول کپی/تکراری گزارش شده‌اند؛ این موضوع ریسک هویت جعلی فروشگاه را بالا می‌برد.");
        }
        if (e.suspiciouslyLowPrice) {
            signals++;
            risk += 13;
            r.reasons.add("قیمت به‌طور غیرعادی پایین‌تر از بازار گزارش شده است.");
        }
        if (e.identityVerified) {
            signals++;
            risk -= 12;
            r.positives.add("هویت یا اطلاعات کسب‌وکار با یک منبع قابل اعتبارسنجی تطبیق داده شده است.");
        }

        risk = Math.max(0, Math.min(100, risk));
        r.riskScore = risk;
        r.trustScore = 100 - risk;
        r.insufficient = signals < 2;
        r.confidence = r.insufficient ? Math.min(40, 18 + signals * 12) : Math.min(95, 35 + signals * 9);

        if (r.insufficient) {
            r.level = "داده ناکافی";
        } else if (risk >= 65) {
            r.level = "پرریسک";
        } else if (risk >= 35) {
            r.level = "نیازمند بررسی";
        } else {
            r.level = "ریسک پایین‌تر";
        }

        return r;
    }
}
