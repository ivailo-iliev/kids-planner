var root = document.documentElement;
var body = document.body;
var viewportWidth = root.clientWidth || body.clientWidth;
var contentWidth = Math.max(root.scrollWidth, body.scrollWidth);
var rows = document.getElementsByTagName("tr");
return {
    engine: "morning routine layout",
    viewport: {width: viewportWidth, height: root.clientHeight || body.clientHeight},
    checks: [
        {
            name: "morning routine fits without horizontal scrolling",
            passed: contentWidth <= viewportWidth,
            details: contentWidth + "px content / " + viewportWidth + "px viewport"
        },
        {
            name: "both children's routine rows are present",
            passed: rows.length === 2,
            details: rows.length + " routine rows"
        }
    ]
};
