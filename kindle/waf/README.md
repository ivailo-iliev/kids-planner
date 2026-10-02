# Kids Planner Kindle WAF

WAF version 1.0.10 leaves orientation and system chrome to Kindle/Mesquite, retains the corner close button, and opens the portrait-aware planner page. The hosted page adapts its layout to the measured viewport using legacy-compatible JavaScript; Kindle-specific Noto Emoji selection remains client-side and the direct GitHub font link is unchanged.

`https://kids-planner.netlify.app/test.html`

The WAF itself is in `kidsplanner/`. Copy that directory to `/var/local/mesquite/kidsplanner` on a jailbroken Kindle and register the `com.ivailo.kidsplanner` handler in `/var/local/appreg.db`.

The `extension/KidsPlanner` directory contains a KUAL extension to install, register, and launch the WAF. Copy the whole directory to `/mnt/us/extensions/KidsPlanner`, then choose **Install / Refresh Kids Planner WAF** in KUAL before choosing **Launch Kids Planner**. The installer stops any previous WAF instance, copies the new files, and keeps a copy of the original app registry at `/mnt/us/kidsplanner-appreg.db.backup` before changing it.

This wrapper loads the routine page over the Kindle's network connection. It does not bundle a static copy of the page or its Netlify functions.
