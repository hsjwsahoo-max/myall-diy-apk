package com.nexustrade.pro;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final View decorView = getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(decorView, (v, windowInsets) -> {
            Insets systemBars = windowInsets.getInsets(
                WindowInsetsCompat.Type.statusBars()
                    | WindowInsetsCompat.Type.displayCutout()
                    | WindowInsetsCompat.Type.navigationBars()
            );
            float density = getResources().getDisplayMetrics().density;
            if (density <= 0f) {
                density = 1f;
            }
            final int topCssPx = Math.round(systemBars.top / density);
            final int bottomCssPx = Math.round(systemBars.bottom / density);

            if (getBridge() != null && getBridge().getWebView() != null) {
                WebView webView = getBridge().getWebView();
                String js = "document.documentElement.style.setProperty('--android-safe-top', '"
                    + topCssPx + "px');"
                    + "document.documentElement.style.setProperty('--android-safe-bottom', '"
                    + bottomCssPx + "px');";
                webView.post(() -> webView.evaluateJavascript(js, null));
            }
            return ViewCompat.onApplyWindowInsets(v, windowInsets);
        });
    }
}

