# Kids Planner Kindle WAF

WAF version 1.0.2 runs the live Kids Planner in a full-screen landscape frame. It asks the Kindle WAF APIs for landscape orientation and fullscreen view mode, disables sleep in the embedded planner URL, and provides a corner close button that returns to the Kindle home screen:

`https://kids-planner.netlify.app/?id=recoHkbAGiDt1mtAH&sleep=off`

The WAF itself is in `kidsplanner/`. Copy that directory to `/var/local/mesquite/kidsplanner` on a jailbroken Kindle and register the `com.ivailo.kidsplanner` handler in `/var/local/appreg.db`.

The `extension/KidsPlanner` directory contains a KUAL extension to install, register, and launch the WAF. Copy the whole directory to `/mnt/us/extensions/KidsPlanner`, then choose **Install / Refresh Kids Planner WAF** in KUAL before choosing **Launch Kids Planner**. The installer stops any previous WAF instance, copies the new files, and keeps a copy of the original app registry at `/mnt/us/kidsplanner-appreg.db.backup` before changing it.

This wrapper loads the live site over the Kindle's network connection. It does not bundle a static copy of the web app or its Netlify functions.
