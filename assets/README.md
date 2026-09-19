# Static breathing-page styles

`breath-tailwind.css` replaces the runtime Tailwind CDN script. To regenerate
with the same major version:

```sh
printf '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n' > /tmp/breath-input.css
npm exec --yes --package=tailwindcss@3.4.17 -- tailwindcss -i /tmp/breath-input.css -o assets/breath-tailwind.css --content breath.html --minify
```

Inline JavaScript is authorized by SHA-256 in each page's CSP meta tag. If an
inline script changes, recalculate its exact UTF-8 hash and update that tag.
