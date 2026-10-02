# Kids Planner Kindle WAF

This WAF opens the live Kids Planner with the configured profile and sleep mode disabled:

`https://kids-planner.netlify.app/?id=recoHkbAGiDt1mtAH&sleep=off`

The WAF itself is in `kidsplanner/`. Copy that directory to `/var/local/mesquite/kidsplanner` on a jailbroken Kindle and register the `com.ivailo.kidsplanner` handler in `/var/local/appreg.db`.

The `extension/KidsPlanner` directory contains a KUAL extension to install, register, and launch the WAF. Copy the whole directory to `/mnt/us/extensions/KidsPlanner`, then launch **Install Kids Planner WAF** from KUAL. The installer keeps a copy of the original app registry at `/mnt/us/kidsplanner-appreg.db.backup` before changing it.

This wrapper loads the live site over the Kindle's network connection. It does not bundle a static copy of the web app or its Netlify functions.
