const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withAndroidAutofillService(config) {
  // 1. Inject Service entry and metadata in AndroidManifest.xml
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
    let serviceObj = app.service.find(
      (s) => s.$ && s.$['android:name'] === serviceName
    );

    const serviceConfig = {
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
      'meta-data': [
        {
          $: {
            'android:name': 'android.service.autofill',
            'android:resource': '@xml/autofill_service_config',
          },
        },
      ],
    };

    if (!serviceObj) {
      app.service.push(serviceConfig);
    } else {
      serviceObj.$ = serviceConfig.$;
      serviceObj['intent-filter'] = serviceConfig['intent-filter'];
      serviceObj['meta-data'] = serviceConfig['meta-data'];
    }

    return config;
  });

  // 2. Generate XML resource, layout and native AutofillService.java source file
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      
      // 2a. Generate res/xml/autofill_service_config.xml
      const xmlDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'xml');
      fs.mkdirSync(xmlDir, { recursive: true });
      const xmlFilePath = path.join(xmlDir, 'autofill_service_config.xml');
      const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<autofill-service xmlns:android="http://schemas.android.com/apk/res/android" />
`;
      fs.writeFileSync(xmlFilePath, xmlContent, 'utf8');

      // 2b. Generate res/layout/autofill_dataset_item.xml
      const layoutDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'layout');
      fs.mkdirSync(layoutDir, { recursive: true });
      const layoutFilePath = path.join(layoutDir, 'autofill_dataset_item.xml');
      const layoutContent = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="horizontal"
    android:padding="12dp"
    android:background="#18181B"
    android:gravity="center_vertical">

    <TextView
        android:id="@+id/autofill_item_icon"
        android:layout_width="32dp"
        android:layout_height="32dp"
        android:text="🔐"
        android:textSize="18sp"
        android:gravity="center"
        android:background="#27272A" />

    <LinearLayout
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_weight="1"
        android:layout_marginStart="12dp"
        android:orientation="vertical">

        <TextView
            android:id="@+id/autofill_item_title"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="#FFFFFF"
            android:textSize="14sp"
            android:textStyle="bold"
            android:ellipsize="end"
            android:singleLine="true" />

        <TextView
            android:id="@+id/autofill_item_subtitle"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="#A1A1AA"
            android:textSize="12sp"
            android:layout_marginTop="2dp"
            android:ellipsize="end"
            android:singleLine="true" />
    </LinearLayout>
</LinearLayout>
`;
      fs.writeFileSync(layoutFilePath, layoutContent, 'utf8');

      // 2c. Generate native AutofillService.java with dynamic resource lookup & safety
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

import android.app.assist.AssistStructure;
import android.app.assist.AssistStructure.ViewNode;
import android.app.assist.AssistStructure.WindowNode;
import android.content.Context;
import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.Dataset;
import android.service.autofill.FillCallback;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveInfo;
import android.service.autofill.SaveRequest;
import android.text.InputType;
import android.view.View;
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;
import androidx.annotation.RequiresApi;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class AutofillService extends android.service.autofill.AutofillService {

    private static final String CREDENTIALS_FILE = "autofill_credentials.json";
    private static final String PENDING_SAVE_FILE = "autofill_pending_save.json";

    // Data structures for node matching
    private static class ParsedStructure {
        AutofillId usernameId;
        AutofillId passwordId;
        String usernameValue;
        String passwordValue;
        String packageName;
        String webDomain;
    }

    private String readStorageFile(String filename) {
        try {
            File file = new File(getFilesDir(), filename);
            if (!file.exists()) return "[]";
            FileInputStream fis = new FileInputStream(file);
            byte[] data = new byte[(int) file.length()];
            fis.read(data);
            fis.close();
            return new String(data, "UTF-8");
        } catch (Throwable t) {
            return "[]";
        }
    }

    private void writeStorageFile(String filename, String content) {
        try {
            File file = new File(getFilesDir(), filename);
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(content.getBytes("UTF-8"));
            fos.close();
        } catch (Throwable ignored) {}
    }

    @Override
    public void onFillRequest(FillRequest request, CancellationSignal cancellationSignal, FillCallback callback) {
        try {
            List<FillContext> contexts = request.getFillContexts();
            if (contexts == null || contexts.isEmpty()) {
                callback.onSuccess(null);
                return;
            }

            FillContext latestContext = contexts.get(contexts.size() - 1);
            AssistStructure structure = latestContext.getStructure();
            if (structure == null) {
                callback.onSuccess(null);
                return;
            }

            ParsedStructure parsed = parseStructure(structure);

            // Require at least a password field or username field to offer autofill / save
            if (parsed.passwordId == null && parsed.usernameId == null) {
                callback.onSuccess(null);
                return;
            }

            FillResponse.Builder responseBuilder = new FillResponse.Builder();

            // 1. Read cached credentials from internal storage file
            String rawJson = readStorageFile(CREDENTIALS_FILE);
            JSONArray credsArray = new JSONArray(rawJson);

            String query = (parsed.webDomain != null && !parsed.webDomain.isEmpty())
                    ? parsed.webDomain.toLowerCase()
                    : (parsed.packageName != null ? parsed.packageName.toLowerCase() : "");

            int layoutId = getResources().getIdentifier("autofill_dataset_item", "layout", getPackageName());
            int titleId = getResources().getIdentifier("autofill_item_title", "id", getPackageName());
            int subtitleId = getResources().getIdentifier("autofill_item_subtitle", "id", getPackageName());

            boolean hasMatches = false;
            for (int i = 0; i < credsArray.length(); i++) {
                JSONObject item = credsArray.optJSONObject(i);
                if (item == null) continue;

                String name = item.optString("name", "");
                String username = item.optString("username", "");
                String password = item.optString("password", "");
                String url = item.optString("url", "");

                // Match query with name, url, or app package
                boolean match = false;
                if (!query.isEmpty()) {
                    if (name.toLowerCase().contains(query) || (url != null && url.toLowerCase().contains(query))) {
                        match = true;
                    } else if (query.contains(name.toLowerCase())) {
                        match = true;
                    }
                }

                // If no specific match was found but we have stored entries, provide top entries
                if (!match && credsArray.length() <= 5) {
                    match = true;
                }

                if (match && layoutId != 0) {
                    Dataset.Builder datasetBuilder = new Dataset.Builder();
                    RemoteViews presentation = new RemoteViews(getPackageName(), layoutId);
                    if (titleId != 0) {
                        presentation.setTextViewText(titleId, name.isEmpty() ? "Vault Manager" : name);
                    }
                    if (subtitleId != 0) {
                        presentation.setTextViewText(subtitleId, username.isEmpty() ? "Auto-fill Password" : username);
                    }

                    if (parsed.usernameId != null && !username.isEmpty()) {
                        datasetBuilder.setValue(parsed.usernameId, AutofillValue.forText(username), presentation);
                    }
                    if (parsed.passwordId != null && !password.isEmpty()) {
                        datasetBuilder.setValue(parsed.passwordId, AutofillValue.forText(password), presentation);
                    }

                    responseBuilder.addDataset(datasetBuilder.build());
                    hasMatches = true;
                }
            }

            // 2. Build SaveInfo with Samsung Pass / Bitwarden style behavior
            List<AutofillId> allIds = new ArrayList<>();
            if (parsed.passwordId != null) allIds.add(parsed.passwordId);
            if (parsed.usernameId != null) allIds.add(parsed.usernameId);

            if (!allIds.isEmpty()) {
                AutofillId[] idArray = allIds.toArray(new AutofillId[0]);
                int saveType = SaveInfo.SAVE_DATA_TYPE_PASSWORD | SaveInfo.SAVE_DATA_TYPE_USERNAME;
                
                // Use password as required if present, or all as optional to allow multi-step logins (e.g. Spotify)
                SaveInfo.Builder saveInfoBuilder = (parsed.passwordId != null)
                        ? new SaveInfo.Builder(saveType, new AutofillId[]{ parsed.passwordId })
                        : new SaveInfo.Builder(saveType, idArray);

                if (parsed.usernameId != null && parsed.passwordId != null) {
                    saveInfoBuilder.setOptionalIds(new AutofillId[]{ parsed.usernameId });
                }

                // Trigger save when the login activity closes or views become invisible (user logged in!)
                saveInfoBuilder.setFlags(SaveInfo.FLAG_SAVE_ON_ALL_VIEWS_INVISIBLE);

                responseBuilder.setSaveInfo(saveInfoBuilder.build());
            }

            callback.onSuccess(responseBuilder.build());
        } catch (Throwable t) {
            try {
                callback.onSuccess(null);
            } catch (Throwable ignored) {}
        }
    }

    @Override
    public void onSaveRequest(SaveRequest request, SaveCallback callback) {
        try {
            List<FillContext> contexts = request.getFillContexts();
            if (contexts == null || contexts.isEmpty()) {
                callback.onSuccess();
                return;
            }

            ParsedStructure parsed = new ParsedStructure();
            // Traverse all contexts in the session (handles multi-step logins where email was screen 1 and password screen 2)
            for (FillContext ctx : contexts) {
                AssistStructure structure = ctx.getStructure();
                if (structure != null) {
                    parseStructureInto(structure, parsed);
                }
            }

            if ((parsed.passwordValue != null && !parsed.passwordValue.isEmpty()) ||
                (parsed.usernameValue != null && !parsed.usernameValue.isEmpty())) {

                String targetName = (parsed.webDomain != null && !parsed.webDomain.isEmpty())
                        ? parsed.webDomain
                        : (parsed.packageName != null ? parsed.packageName : "New Login");

                if (targetName.contains(".")) {
                    String[] parts = targetName.split(java.util.regex.Pattern.quote("."));
                    if (parts.length >= 2) {
                        String candidate = parts[parts.length - (parts[parts.length - 1].equals("android") ? 2 : 1)];
                        targetName = candidate.substring(0, 1).toUpperCase() + candidate.substring(1);
                    }
                }

                String existingPending = readStorageFile(PENDING_SAVE_FILE);
                JSONArray pendingArray = new JSONArray(existingPending);

                JSONObject newSave = new JSONObject();
                newSave.put("name", targetName);
                newSave.put("username", parsed.usernameValue != null ? parsed.usernameValue : "");
                newSave.put("password", parsed.passwordValue != null ? parsed.passwordValue : "");
                newSave.put("url", parsed.webDomain != null ? parsed.webDomain : parsed.packageName);
                newSave.put("timestamp", System.currentTimeMillis());

                pendingArray.put(newSave);
                writeStorageFile(PENDING_SAVE_FILE, pendingArray.toString());
            }

            callback.onSuccess();
        } catch (Throwable t) {
            try {
                callback.onSuccess();
            } catch (Throwable ignored) {}
        }
    }

    private ParsedStructure parseStructure(AssistStructure structure) {
        ParsedStructure result = new ParsedStructure();
        parseStructureInto(structure, result);
        return result;
    }

    private void parseStructureInto(AssistStructure structure, ParsedStructure result) {
        if (structure == null) return;
        int windowCount = structure.getWindowNodeCount();
        for (int i = 0; i < windowCount; i++) {
            WindowNode windowNode = structure.getWindowNodeAt(i);
            ViewNode rootView = windowNode.getRootViewNode();
            traverseNode(rootView, result);
        }
    }

    private void traverseNode(ViewNode node, ParsedStructure result) {
        if (node == null) return;

        if (result.packageName == null && node.getIdPackage() != null) {
            result.packageName = node.getIdPackage();
        }
        if (result.webDomain == null && node.getWebDomain() != null) {
            result.webDomain = node.getWebDomain();
        }

        String[] hints = node.getAutofillHints();
        int inputType = node.getInputType();
        String idEntry = node.getIdEntry();
        
        // Extract value from getText() or AutofillValue (critical for Android 9+ password fields)
        String val = null;
        CharSequence text = node.getText();
        if (text != null && text.length() > 0) {
            val = text.toString();
        } else if (node.getAutofillValue() != null) {
            AutofillValue afv = node.getAutofillValue();
            if (afv.isText() && afv.getTextValue() != null) {
                val = afv.getTextValue().toString();
            }
        }

        boolean isPassword = false;
        boolean isUsername = false;

        if (hints != null) {
            for (String hint : hints) {
                if (hint != null) {
                    String h = hint.toLowerCase();
                    if (h.contains("password")) isPassword = true;
                    if (h.contains("username") || h.contains("email")) isUsername = true;
                }
            }
        }

        if ((inputType & InputType.TYPE_NUMBER_VARIATION_PASSWORD) == InputType.TYPE_NUMBER_VARIATION_PASSWORD ||
            (inputType & InputType.TYPE_TEXT_VARIATION_PASSWORD) == InputType.TYPE_TEXT_VARIATION_PASSWORD ||
            (inputType & InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD) == InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD) {
            isPassword = true;
        }

        if ((inputType & InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS) == InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS ||
            (inputType & InputType.TYPE_TEXT_VARIATION_WEB_EMAIL_ADDRESS) == InputType.TYPE_TEXT_VARIATION_WEB_EMAIL_ADDRESS) {
            isUsername = true;
        }

        if (idEntry != null) {
            String lowerId = idEntry.toLowerCase();
            if (lowerId.contains("password") || lowerId.contains("pass") || lowerId.contains("pwd")) {
                isPassword = true;
            }
            if (lowerId.contains("user") || lowerId.contains("login") || lowerId.contains("email") || lowerId.contains("account")) {
                isUsername = true;
            }
        }

        if (isPassword && result.passwordId == null) {
            result.passwordId = node.getAutofillId();
            if (val != null && !val.isEmpty()) {
                result.passwordValue = val;
            }
        } else if (isUsername && result.usernameId == null) {
            result.usernameId = node.getAutofillId();
            if (val != null && !val.isEmpty()) {
                result.usernameValue = val;
            }
        } else {
            // Update values if previously found without values
            if (isPassword && (result.passwordValue == null || result.passwordValue.isEmpty()) && val != null && !val.isEmpty()) {
                result.passwordValue = val;
            }
            if (isUsername && (result.usernameValue == null || result.usernameValue.isEmpty()) && val != null && !val.isEmpty()) {
                result.usernameValue = val;
            }
        }

        for (int i = 0; i < node.getChildCount(); i++) {
            traverseNode(node.getChildAt(i), result);
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
