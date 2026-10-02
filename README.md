# Navira — Offline GNSS Lab

Navira displays foreground location readings from Expo Location and, in a rebuilt Android APK, separate native GNSS diagnostics. The location screen passed owner testing on a Samsung A16. The owner also verified fresh location updates in airplane mode with Wi-Fi off in a milestone 2 preview APK; see [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md). The new GNSS diagnostics and GitHub-built APK have **not** been tested on a phone. Satellite status cannot prove that an Expo location reading came exclusively from GNSS.

## Development

Use Node 22.13 or newer with the checked-in npm lockfile.

```bash
npm ci
npx expo start --tunnel
```

Expo Go still runs the location screen, but its GNSS section shows that the custom native module is unavailable. Native module changes require a new Android binary; Metro reloads JavaScript only. Local checks: `npx expo lint`, `npx tsc --noEmit`, and `npx expo-doctor`.

## Android release APK: GitHub Actions

[`.github/workflows/android-preview.yml`](.github/workflows/android-preview.yml) is the primary builder. It runs manually on `ubuntu-24.04` with Node 22.13.1, Java 17, and Android SDK 36. It runs `npm ci` and project checks, generates Android with Expo prebuild, confirms the local GNSS module is linked, runs `:app:assembleRelease`, checks the signed APK and embedded JavaScript bundle, and uploads `navira-preview-apk` for three days. The Android package remains `ke.co.xvira.navira`. Generated `android/` is ignored; the signing config is reapplied by `plugins/withNaviraReleaseSigning.js` on every prebuild. The workflow needs no Expo token.

A Git remote was not configured when this workflow was prepared. After adding and pushing to your GitHub repository's default branch, configure these repository Actions secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `NAVIRA_KEYSTORE_BASE64` | Base64 of the existing EAS Android keystore file |
| `NAVIRA_KEYSTORE_PASSWORD` | That keystore's store password |
| `NAVIRA_KEY_ALIAS` | Its key alias |
| `NAVIRA_KEY_PASSWORD` | Its key password |

Use the **same key** as the APK already installed on the Samsung A16, or Android will reject an update under the same application ID. To retrieve it yourself, run `npx eas-cli@latest credentials -p android` in this project, select the Android build profile used for the installed APK, then choose **credentials.json: Upload/Download credentials between EAS servers and your local json → Download credentials from EAS to credentials.json**. Read that downloaded file for the keystore path and three signing values; encode the keystore file as one-line Base64 before adding the four GitHub secrets. Do not commit `credentials.json` or the keystore, and do not share their contents in chat. `credentials.json` and `*.jks` are ignored by Git. [Expo credential download instructions](https://docs.expo.dev/app-signing/syncing-credentials/)

Once the workflow file is on the default branch, open **Actions → Android preview APK → Run workflow**. Download the `navira-preview-apk` artifact from that run. Missing signing secrets cause an explicit failure; the workflow never falls back to the debug key. Compare the signing certificate fingerprint with the installed APK before installing over it. No workflow was pushed or run during this implementation.

## Device checks for the new APK

1. Install the signed APK; confirm the existing location cards still update and that Android GNSS diagnostics appear separately.
2. Outdoors with precise foreground location, wait for a fresh GNSS status. Check reported count, used-in-fix count, constellation/SVID, C/N₀ in dB-Hz, and status age. Zero satellites must show as zero if Android reports an empty status.
3. Turn Location off, deny or reduce to approximate permission, then restore precise access; check the separate GNSS availability messages.
4. Lock and unlock the phone; old GNSS status must clear or become stale until a new callback arrives. Repeat to check for duplicate callbacks or excess battery use.
5. Repeat the airplane-mode, Wi-Fi-off location test. Record whether the previous offline behavior survives this new APK. GNSS status and C/N₀ do not measure positioning accuracy or prove the Expo reading's source.

## Dependency audit

On 2026-10-02, `npm audit` reported 12 transitive findings (8 moderate, 4 high), including `node-forge` (high) and `uuid` (moderate) through the Expo dependency tree. No forced audit fix was applied: `npm audit fix --force` proposes downgrading Expo to 44. Recheck advisories and SDK-compatible updates before broader distribution.
