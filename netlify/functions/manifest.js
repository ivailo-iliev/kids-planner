exports.handler = async function (event, context) {
  const userId = new URL(event.headers.referer).searchParams.get('id');
  const webmanifest = {
    "id": "https://kids-planner.netlify.app/",
    "scope": "https://kids-planner.netlify.app/",
    "start_url": `https://kids-planner.netlify.app/?id=${userId ? '?id=' + userId : ''}`,
    "name": "Kids Planner",
    "short_name": "Kids Planner",
    "description": "A static, non-interactive weekly planner for pre-school children. Features a clock, weather widget and a weekly calendar with activities.",
    "lang": "en",
    "theme_color": "#ffffff",
    "background_color": "#ffffff",
    "display": "fullscreen",
    "orientation": "landscape",
    "categories": [
      "education",
      "kids",
      "productivity"
    ],
    "screenshots": [
      {
        "src": "https://kids-planner.netlify.app/screenshot.png",
        "sizes": "1920x1080",
        "type": "image/png"
      }
    ],
    "icons": [
      {
        "src": "https://kids-planner.netlify.app/icon-64x64.png",
        "sizes": "64x64",
        "type": "image/png"
      },
      {
        "src": "https://kids-planner.netlify.app/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "https://kids-planner.netlify.app/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      },
      {
        "src": "https://kids-planner.netlify.app/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "https://kids-planner.netlify.app/maskable-icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "maskable"
      },
    ]
  };

  return {
    statusCode: 200,
    body: JSON.stringify(webmanifest),
    headers: {
      'Content-Type': 'application/manifest+json'
    },
  }
}
