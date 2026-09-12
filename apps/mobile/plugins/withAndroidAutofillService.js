const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidAutofillService(config) {
  return withAndroidManifest(config, (config) => {
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
};
