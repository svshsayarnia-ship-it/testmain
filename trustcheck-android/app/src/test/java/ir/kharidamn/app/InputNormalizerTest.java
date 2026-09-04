package ir.kharidamn.app;

import org.junit.Test;

import static org.junit.Assert.*;

public class InputNormalizerTest {
    @Test
    public void parsesUsernameVariants() {
        assertEquals("shop.name", InputNormalizer.extractHandle("@shop.name"));
        assertEquals("shop_name", InputNormalizer.extractHandle("https://www.instagram.com/shop_name/?igsh=abc"));
    }

    @Test
    public void postUrlNeedsPublicResolution() {
        assertNull(InputNormalizer.extractHandle("https://www.instagram.com/p/ABC123/"));
        assertNotNull(InputNormalizer.extractInstagramUrl("این پست رو ببین https://www.instagram.com/p/ABC123/"));
    }

    @Test
    public void rejectsNonInstagramGarbage() {
        assertFalse(InputNormalizer.isInstagramTarget("not a url !"));
    }
}
