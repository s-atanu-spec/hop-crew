# Publishing Hop Crew

Three steps, in order. Each later step needs the one before it.

## 1. A link anyone can play (GitHub Pages)

1. On github.com create a new public repository, for example `hop-crew`.
2. Upload everything inside this project folder (drag the files into "Add file, Upload files"), then commit.
   The file is about 15 MB, which is within GitHub's limits.
3. In the repository open Settings, Pages. Under "Build and deployment" choose "Deploy from a branch", branch `main`, folder `/ (root)`, Save.
4. After a minute or two the game is live at `https://<your-user>.github.io/hop-crew/`. Put that link in the repository's "About" box.
   That address shows the welcome page (`index.html`); its Play button opens the game (`play.html`).

Each repository has its own address, so this does not touch the VitePDF page: that one lives at `https://<your-user>.github.io/vitepdf/`.
The welcome page links to `https://github.com/s-atanu-spec/hop-crew`. If you give the repository another name, change that link in `index.html` (it appears twice).

To publish a new version later: replace the files, and make sure `VERSION` in `sw.js` has changed (the build notes in the README cover this), so installed copies update.

## 2. On your phones, no APK needed

1. Open the link in Chrome on the phone.
2. Menu (three dots), "Add to Home screen", then "Install".
3. It now has its own icon, opens full screen and works offline after the first open.

This is the quickest way for the two of you, and updates arrive by themselves.

## 3. An APK file you can share

PWABuilder turns the link into an Android app file. It is a free website; nothing to install on the laptop.

1. Go to pwabuilder.com, paste the link from step 1 and press Start.
2. Choose "Package for stores", then Android. Keep the default (signed package) and set:
   - Package ID: for example `io.github.<your-user>.hopcrew`
   - App name: Hop Crew
3. Download the zip. Keep the whole zip somewhere safe: it holds the signing key, which you need to make updates later.
4. Inside the zip, the `.apk` file is the one to send to family. The `.aab` file is only for the Play Store.
5. On each phone: open the APK and allow "Install unknown apps" for the app you opened it from (Files, WhatsApp, Drive).

Two things to know:

- **First open needs internet.** The APK is a thin shell that opens your link full screen. After the first open the game is saved on the phone and plays offline. The phone needs Chrome installed.
- **Address bar.** Until Android can confirm you own the link, the app shows a thin address bar at the top. To remove it, publish the `assetlinks.json` file from the PWABuilder zip at `https://<your-user>.github.io/.well-known/assetlinks.json`. For a GitHub link that means a second repository named exactly `<your-user>.github.io`, containing a folder `.well-known` with that file and an empty file named `.nojekyll`. Pages must be switched on for that repository too.

## A fully offline APK (later, optional)

An APK with the game packed inside, needing no link and no internet, has to be built with Android Studio. It is a small project (one screen that loads `play.html`) and is the same thing the home Wi-Fi app will do when the game is added there.
