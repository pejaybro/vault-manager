const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withAndroidAutofillService(config) {
  // 1. Inject Service entry in AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;

    if (!androidManifest.manifest.application) {
      androidManifest.manifest.application = [{}];
    }

    const app = androidManifest.manifest.application[0];
    if (!app.service) {
      app.service = [];
    }

    const serviceName = 'com.vaultmanager.app.AutofillService';
    const existing = app.service.find(
      (s) => s.$ && s.$['android:name'] === serviceName
    );

    if (!existing) {
      app.service.push({
        $: {
          'android:name': serviceName,
          'android:label': 'Vault Manager',
          'android:permission': 'android.permission.BIND_AUTOFILL_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.service.autofill.AutofillService',
                },
              },
            ],
          },
        ],
      });
    }

    return config;
  });

  // 2. Generate native AutofillService.java source file to prevent ClassNotFoundException crashes
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const javaDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'java',
        'com',
        'vaultmanager',
        'app'
      );

      fs.mkdirSync(javaDir, { recursive: true });

      const javaFilePath = path.join(javaDir, 'AutofillService.java');
      const javaCode = `package com.vaultmanager.app;

import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.FillCallback;
import android.service.autofill.FillRequest;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import androidx.annotation.RequiresApi;

@RequiresApi(api = Build.VERSION_CODES.O)
public class AutofillService extends android.service.autofill.AutofillService {

    @Override
    public void onFillRequest(FillRequest request, CancellationSignal cancellationSignal, FillCallback callback) {
        try {
            callback.onSuccess(null);
        } catch (Exception e) {
            callback.onSuccess(null);
        }
    }

    @Override
    public void onSaveRequest(SaveRequest request, SaveCallback callback) {
        try {
            callback.onSuccess();
        } catch (Exception e) {
            callback.onSuccess();
        }
    }
}
`;

      fs.writeFileSync(javaFilePath, javaCode, 'utf8');
      return config;
    },
  ]);

  return config;
}

module.exports = withAndroidAutofillService;
