// The GitHub Pages copy (snumood.github.io/homepage/) moved to https://snumood.com/ (2026-10-31, combined account).
// Old links, bookmarks and printed addresses land on the same page there.
(function () {
  if (location.hostname !== 'snumood.github.io') return;
  var base = '/homepage/', path = location.pathname;
  var rest = path.indexOf(base) === 0 ? path.slice(base.length) : '';
  location.replace('https://snumood.com/' + rest + location.search + location.hash);
})();
