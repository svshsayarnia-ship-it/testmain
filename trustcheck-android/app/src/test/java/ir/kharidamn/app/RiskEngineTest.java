package ir.kharidamn.app;

import org.junit.Test;

import static org.junit.Assert.*;

public class RiskEngineTest {
    @Test
    public void marksSparseEvidenceAsInsufficient() {
        RiskEvidence e = new RiskEvidence();
        e.followers = 100_000;
        e.followersAutoFetched = true;
        RiskResult r = RiskEngine.analyze(e);
        assertTrue(r.insufficient);
        assertEquals("داده ناکافی", r.level);
    }

    @Test
    public void detectsLowEngagementAndIdentityMismatch() {
        RiskEvidence e = new RiskEvidence();
        e.followers = 100_000;
        e.averageLikes = 120;
        e.averageComments = 8;
        e.claimedStartYear = 2018;
        e.observedJoinYear = 2025;
        e.usernameChanges = 6;
        e.phoneComplaintReports = 4;
        e.cardTransferOnly = true;
        e.suspiciouslyLowPrice = true;

        RiskResult r = RiskEngine.analyze(e);
        assertFalse(r.insufficient);
        assertTrue(r.riskScore >= 65);
        assertEquals("پرریسک", r.level);
        assertTrue(r.reasons.size() >= 4);
    }

    @Test
    public void verifiedIdentityCanReduceRiskButNotHideOtherSignals() {
        RiskEvidence e = new RiskEvidence();
        e.followers = 20_000;
        e.averageLikes = 800;
        e.averageComments = 30;
        e.usernameChanges = 0;
        e.phoneComplaintReports = 0;
        e.domainAgeMonths = 36;
        e.identityVerified = true;

        RiskResult r = RiskEngine.analyze(e);
        assertFalse(r.insufficient);
        assertTrue(r.riskScore < 35);
        assertEquals("ریسک پایین‌تر", r.level);
    }
}
