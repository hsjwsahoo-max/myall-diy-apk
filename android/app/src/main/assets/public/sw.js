/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b1bafff1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "8165cb6223ed508107c4c0e6692ba867"
  }, {
    "url": "pwa-512x512.png",
    "revision": "536a8685db68fd10be5d69959b21afc7"
  }, {
    "url": "pwa-192x192.png",
    "revision": "545974982c4ba29b823614da32a6009a"
  }, {
    "url": "index.html",
    "revision": "81b420fa96f7cc770c7089f6549e28ae"
  }, {
    "url": "icon.svg",
    "revision": "e5792ec2b3738db511697e1bdc135f04"
  }, {
    "url": "icon-maskable.svg",
    "revision": "376915bb74b28e7aa81c65bc2d6c311d"
  }, {
    "url": "favicon.png",
    "revision": "c3eb2c796f008381a3d0adae632b8c60"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "c03629e1931c15374c2b91db5af5b3f2"
  }, {
    "url": "qa/nexustrade/wallet_usdt_detail_390.png",
    "revision": "a44d1cf4269c713cd7df46dfa47f078b"
  }, {
    "url": "qa/nexustrade/wallet_settings_390.png",
    "revision": "6879d7b7b49a071bda1ccbf096287b9f"
  }, {
    "url": "qa/nexustrade/wallet_send_390.png",
    "revision": "653494bb438186de7e3a3bf680015f69"
  }, {
    "url": "qa/nexustrade/wallet_receive_390.png",
    "revision": "fc385a6f715b565e27e79d60f2291060"
  }, {
    "url": "qa/nexustrade/wallet_portfolio_390.png",
    "revision": "97095d7b8f94ba6fcf10043125dc43a5"
  }, {
    "url": "qa/nexustrade/wallet_my_wallets_390.png",
    "revision": "0f4b995448d1a915fde4fa4f33caea61"
  }, {
    "url": "qa/nexustrade/wallet_home_430.png",
    "revision": "d8aa20d552b4df692a90b226657b07db"
  }, {
    "url": "qa/nexustrade/wallet_home_412.png",
    "revision": "4cd2ca12eff8e50b348ab2a5c52c15ea"
  }, {
    "url": "qa/nexustrade/wallet_home_390.png",
    "revision": "7f1d1fae992742c256830df1d308bca6"
  }, {
    "url": "qa/nexustrade/wallet_home_375.png",
    "revision": "ad360faf8bb783366ecabb5d5cff52e4"
  }, {
    "url": "qa/nexustrade/wallet_home_360.png",
    "revision": "1e8f5bdcb81c4c91545826d061a63410"
  }, {
    "url": "qa/nexustrade/wallet_history_390.png",
    "revision": "d185cf4904d4ea197555abfb600a3e57"
  }, {
    "url": "qa/nexustrade/wallet_assets_low_value_390.png",
    "revision": "cbdcb1da89112fdad5e78286b0e43933"
  }, {
    "url": "qa/nexustrade/wallet_assets_430.png",
    "revision": "926f99f4d0868a8cb094f76d704d34fa"
  }, {
    "url": "qa/nexustrade/wallet_assets_412.png",
    "revision": "35a627fcbd113c4df565712bd3d82966"
  }, {
    "url": "qa/nexustrade/wallet_assets_390.png",
    "revision": "205a166277cf9faafe3c2a05ae419cac"
  }, {
    "url": "qa/nexustrade/wallet_assets_375.png",
    "revision": "1a994938c8c0c43463a7d6a29b2f3cd8"
  }, {
    "url": "qa/nexustrade/wallet_assets_360.png",
    "revision": "b8f2fed5feccf7b8b9ea19da22b982ea"
  }, {
    "url": "qa/nexustrade/wallet_approvals_390.png",
    "revision": "86c0cc22d31de0a23f7b0ff016f74ec7"
  }, {
    "url": "assets/index-CW6yX803.css",
    "revision": null
  }, {
    "url": "assets/index-BXNXtz15.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "c03629e1931c15374c2b91db5af5b3f2"
  }, {
    "url": "favicon.png",
    "revision": "c3eb2c796f008381a3d0adae632b8c60"
  }, {
    "url": "icon.svg",
    "revision": "e5792ec2b3738db511697e1bdc135f04"
  }, {
    "url": "pwa-192x192.png",
    "revision": "545974982c4ba29b823614da32a6009a"
  }, {
    "url": "pwa-512x512.png",
    "revision": "536a8685db68fd10be5d69959b21afc7"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "8165cb6223ed508107c4c0e6692ba867"
  }, {
    "url": "manifest.webmanifest",
    "revision": "0c7f78c96d757488179d2ddf2db9313d"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/index.html"), {
    denylist: [/^\/api\//]
  }));
  workbox.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-stylesheets",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 20,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/\.(?:png|jpg|jpeg|svg|gif|webp)$/i, new workbox.StaleWhileRevalidate({
    "cacheName": "static-media-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 2592000
    })]
  }), 'GET');

}));
