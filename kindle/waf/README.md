# Kids Planner Kindle WAF

WAF version 1.0.4 prefers the fullscreen view mode and requests landscape orientation and fullscreen at startup. It loads the static `test.html` routine page and provides a corner close button that returns to the Kindle home screen. Fullscreen chrome behavior remains to be confirmed on the Kindle's legacy firmware:

`https://kids-planner.netlify.app/test.html`

The WAF itself is in `kidsplanner/`. Copy that directory to `/var/local/mesquite/kidsplanner` on a jailbroken Kindle and register the `com.ivailo.kidsplanner` handler in `/var/local/appreg.db`.

The `extension/KidsPlanner` directory contains a KUAL extension to install, register, and launch the WAF. Copy the whole directory to `/mnt/us/extensions/KidsPlanner`, then choose **Install / Refresh Kids Planner WAF** in KUAL before choosing **Launch Kids Planner**. The installer stops any previous WAF instance, copies the new files, and keeps a copy of the original app registry at `/mnt/us/kidsplanner-appreg.db.backup` before changing it.

This wrapper loads the routine page over the Kindle's network connection. It does not bundle a static copy of the page or its Netlify functions.
