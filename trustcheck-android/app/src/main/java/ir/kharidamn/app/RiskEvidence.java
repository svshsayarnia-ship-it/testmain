package ir.kharidamn.app;

public class RiskEvidence {
    public String target = "";
    public String handle = "";
    public String phone = "";
    public String domain = "";

    public long followers = -1;
    public long averageLikes = -1;
    public long averageComments = -1;
    public int claimedStartYear = -1;
    public int observedJoinYear = -1;
    public int usernameChanges = -1;
    public int phoneComplaintReports = -1;
    public int domainAgeMonths = -1;

    public boolean cardTransferOnly;
    public boolean stolenOrReusedImages;
    public boolean suspiciouslyLowPrice;
    public boolean identityVerified;
    public boolean followersAutoFetched;
}
