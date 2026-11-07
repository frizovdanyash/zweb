package chat.zweb.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.text.InputType;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {
    private static final int REQ_MEDIA = 101;
    private static final int REQ_NOTIFICATIONS = 102;
    private static final String PREFS = "zweb";
    private static final String KEY_URL = "start_url";
    private static final int BACKGROUND = Color.parseColor("#0B0613");

    private WebView webView;
    private PermissionRequest pendingPermissionRequest;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(BACKGROUND);

        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        applyEdgeInsets();
        configureWebView();

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return openExternallyIfNeeded(request.getUrl());
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return openExternallyIfNeeded(Uri.parse(url));
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                paintBars();
            }

            @SuppressWarnings("deprecation")
            @Override
            public void onReceivedError(WebView view, int errorCode, String description,
                                        String failingUrl) {
                if(failingUrl != null && failingUrl.equals(view.getUrl())) {
                    showServerDialog();
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                String[] wanted = request.getResources();
                boolean needsMedia = false;
                for(String resource : wanted) {
                    if(PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)
                        || PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                        needsMedia = true;
                        break;
                    }
                }

                if(!needsMedia) {
                    request.deny();
                    return;
                }

                if(hasMediaPermission()) {
                    request.grant(wanted);
                    return;
                }

                pendingPermissionRequest = request;
                requestPermissions(
                    new String[]{Manifest.permission.RECORD_AUDIO, Manifest.permission.CAMERA},
                    REQ_MEDIA);
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                pendingPermissionRequest = null;
            }
        });

        requestNotificationPermission();

        Intent intent = getIntent();
        if(intent != null && intent.getBooleanExtra("change_url", false)) {
            showServerDialog();
        }

        webView.loadUrl(getStartUrl());
    }

    private String getStartUrl() {
        SharedPreferences prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String saved = prefs.getString(KEY_URL, null);
        if(saved != null && saved.startsWith("https://")) return saved;
        return getString(R.string.zweb_default_url);
    }

    private void saveStartUrl(String url) {
        getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit().putString(KEY_URL, url).apply();
    }

    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportMultipleWindows(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " zWebApp/1.0");

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(webView, true);

        webView.setBackgroundColor(BACKGROUND);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
    }

    private void applyEdgeInsets() {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            webView.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets bars = insets.getInsets(
                    WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                view.setPadding(0, bars.top, 0, bars.bottom);
                return WindowInsets.CONSUMED;
            });
        }
        paintBars();
    }

    private void paintBars() {
        getWindow().setStatusBarColor(BACKGROUND);
        getWindow().setNavigationBarColor(BACKGROUND);
    }

    private boolean hasMediaPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                == PackageManager.PERMISSION_GRANTED
            && ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void requestNotificationPermission() {
        if(Build.VERSION.SDK_INT >= 33
            && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(
                new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFICATIONS);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if(requestCode == REQ_MEDIA) {
            PermissionRequest request = pendingPermissionRequest;
            pendingPermissionRequest = null;
            if(request == null) return;

            if(grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                request.grant(request.getResources());
            } else {
                request.deny();
                Toast.makeText(this, R.string.need_microphone, Toast.LENGTH_SHORT).show();
            }
        }
    }

    private boolean openExternallyIfNeeded(Uri uri) {
        if(uri == null) return false;
        String scheme = uri.getScheme();
        if(scheme == null) return false;

        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase();

        if(scheme.equals("http") || scheme.equals("https")) {
            if(isKnownHost(host)) return false;
        }

        openInBrowser(uri);
        return true;
    }

    private void openInBrowser(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch(ActivityNotFoundException ignored) {
            Toast.makeText(this, R.string.no_app_for_link, Toast.LENGTH_SHORT).show();
        }
    }

    private boolean isKnownHost(String host) {
        if(host.isEmpty()) return false;

        String own = Uri.parse(getStartUrl()).getHost();
        if(own != null) {
            own = own.toLowerCase();
            if(host.equals(own) || host.endsWith("." + own)) return true;
        }

        if(host.equals("t.me") || host.endsWith(".t.me")) return true;
        if(host.equals("telegram.me") || host.endsWith(".telegram.me")) return true;
        if(host.equals("localhost") || host.equals("10.0.2.2")) return true;

        return false;
    }

    private void showServerDialog() {
        float density = getResources().getDisplayMetrics().density;
        int pad = Math.round(20 * density);

        LinearLayout box = new LinearLayout(this);
        box.setOrientation(LinearLayout.VERTICAL);
        box.setPadding(pad, Math.round(8 * density), pad, 0);

        TextView label = new TextView(this);
        label.setText(R.string.choose_server_hint);
        label.setTextColor(Color.parseColor("#9C93B8"));
        box.addView(label);

        EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_TEXT_VARIATION_URI | InputType.TYPE_CLASS_TEXT);
        input.setHint(R.string.choose_server_example);
        input.setText(getStartUrl());
        input.setSelectAllOnFocus(true);
        LinearLayout.LayoutParams inputParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        inputParams.topMargin = Math.round(10 * density);
        box.addView(input, inputParams);

        AlertDialog dialog = new AlertDialog.Builder(this)
            .setTitle(R.string.choose_server)
            .setView(box)
            .setPositiveButton(R.string.choose_server_use_default, null)
            .setNegativeButton(android.R.string.cancel, null)
            .create();

        dialog.setOnShowListener(ignored -> {
            Button positive = dialog.getButton(AlertDialog.BUTTON_POSITIVE);
            positive.setOnClickListener(v -> {
                String url = input.getText().toString().trim();
                if(url.isEmpty()) {
                    url = getString(R.string.zweb_default_url);
                }
                if(!url.startsWith("https://")) {
                    input.setError(getString(R.string.choose_server_bad_url));
                    return;
                }
                if(!url.endsWith("/")) url = url + "/";

                saveStartUrl(url);
                dialog.dismiss();
                if(webView != null) webView.loadUrl(url);
            });
        });

        dialog.show();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if(intent == null) return;

        if(intent.getBooleanExtra("change_url", false)) {
            showServerDialog();
            return;
        }

        if(Intent.ACTION_VIEW.equals(intent.getAction()) && intent.getData() != null
            && webView != null) {
            webView.loadUrl(intent.getData().toString());
        }
    }

    @Override
    public void onBackPressed() {
        if(webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
        if(webView != null) webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if(webView != null) webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if(webView != null) {
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
