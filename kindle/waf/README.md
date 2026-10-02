# Kids Planner Kindle WAF

WAF version 1.0.6 requests the fullscreen view mode and landscape orientation, retains the corner close button, and opens the routine-only page without diagnostic controls. On the legacy Kindle WebKit user-agent signature, client-side detection selects the cached same-origin TTF font endpoint; server-side Kindle detection is not used for font selection. The manifest requests search-bar suppression and the page reapplies its top-navigation configuration when the WAF returns to the foreground. Actual system-chrome suppression remains to be confirmed on firmware 5.12.2.2.

`https://kids-planner.netlify.app/test.html`

The WAF itself is in `kidsplanner/`. Copy that directory to `/var/local/mesquite/kidsplanner` on a jailbroken Kindle and register the `com.ivailo.kidsplanner` handler in `/var/local/appreg.db`.

The `extension/KidsPlanner` directory contains a KUAL extension to install, register, and launch the WAF. Copy the whole directory to `/mnt/us/extensions/KidsPlanner`, then choose **Install / Refresh Kids Planner WAF** in KUAL before choosing **Launch Kids Planner**. The installer stops any previous WAF instance, copies the new files, and keeps a copy of the original app registry at `/mnt/us/kidsplanner-appreg.db.backup` before changing it.

This wrapper loads the routine page over the Kindle's network connection. It does not bundle a static copy of the page or its Netlify functions.
