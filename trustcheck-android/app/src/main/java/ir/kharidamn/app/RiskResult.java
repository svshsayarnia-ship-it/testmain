package ir.kharidamn.app;

import java.util.ArrayList;
import java.util.List;

public class RiskResult {
    public int riskScore;
    public int trustScore;
    public int confidence;
    public boolean insufficient;
    public String level = "نامشخص";
    public final List<String> reasons = new ArrayList<>();
    public final List<String> positives = new ArrayList<>();
}
