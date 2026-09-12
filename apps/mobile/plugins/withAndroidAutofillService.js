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

  // 3. Set AGP 8.7.3 and Gradle wrapper 8.10.2 for Android SDK 34 stability
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;

      // Update gradle-wrapper.properties
      const propertiesPath = path.join(
        projectRoot,
        'android',
        'gradle',
        'wrapper',
        'gradle-wrapper.properties'
      );
      if (fs.existsSync(propertiesPath)) {
        let content = fs.readFileSync(propertiesPath, 'utf8');
        content = content.replace(/gradle-.*-bin\.zip/g, 'gradle-8.10.2-all.zip');
        content = content.replace(/gradle-.*-all\.zip/g, 'gradle-8.10.2-all.zip');
        fs.writeFileSync(propertiesPath, content, 'utf8');
      }

      // Set AGP 8.8.2 and pin SDK 34 for React Native 0.87 & Gradle 8.10.2 compatibility
      const buildGradlePath = path.join(projectRoot, 'android', 'build.gradle');
      if (fs.existsSync(buildGradlePath)) {
        let bgContent = fs.readFileSync(buildGradlePath, 'utf8');
        bgContent = bgContent.replace(
          /classpath\(['"]com\.android\.tools\.build:gradle.*['"]\)/g,
          "classpath('com.android.tools.build:gradle:8.8.2')"
        );
        if (!bgContent.includes('compileSdkVersion = 34')) {
          bgContent = `buildscript {
  ext {
    buildToolsVersion = "34.0.0"
    minSdkVersion = 24
    compileSdkVersion = 34
    targetSdkVersion = 34
  }
}\n\n` + bgContent;
        }
        fs.writeFileSync(buildGradlePath, bgContent, 'utf8');
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withAndroidAutofillService;
