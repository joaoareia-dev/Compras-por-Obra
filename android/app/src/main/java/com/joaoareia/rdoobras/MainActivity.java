package com.joaoareia.rdoobras;

import android.os.Bundle;
import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    configureWebViewForLiveUpdates();
  }

  private void configureWebViewForLiveUpdates() {
    if (bridge == null || bridge.getWebView() == null) {
      return;
    }

    WebSettings settings = bridge.getWebView().getSettings();
    settings.setCacheMode(WebSettings.LOAD_NO_CACHE);
  }
}
