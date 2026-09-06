package com.gilaniai.app;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Ensure the decor fits system windows on Android
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);

        // Apply insets padding to the root content view so notification bar and navigation buttons do not block the app
        View contentView = findViewById(android.R.id.content);
        if (contentView != null) {
            ViewCompat.setOnApplyWindowInsetsListener(contentView, (view, windowInsets) -> {
                Insets systemBars = windowInsets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
                );
                Insets ime = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
                boolean imeVisible = windowInsets.isVisible(WindowInsetsCompat.Type.ime());

                int bottomInset = imeVisible ? ime.bottom : systemBars.bottom;

                view.setPadding(systemBars.left, systemBars.top, systemBars.right, bottomInset);

                // Notify web app that native insets are actively handled
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().evaluateJavascript(
                        "document.documentElement.classList.add('native-insets-applied');",
                        null
                    );
                }

                return windowInsets;
            });
        }
    }
}
