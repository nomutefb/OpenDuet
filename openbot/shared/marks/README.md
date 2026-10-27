# Vendored brand marks

Vendored rather than fetched, because the setup window draws before it has any network guarantee.

The two PNGs sit inside an SVG wrapper only so every mark is one file type: both apps resolve a
mark by globbing `*.svg`, and a second extension would mean a second rule in each.

Each mark carries a `<title>` naming the product, because the linter rejects an SVG without one.

Renamed to the harness or provider id they belong to, so a row finds its mark by its own id and
there is no second mapping to keep in step.

Every row shows its name whether or not it has a mark. The mark sits beside the name and never
replaces it.
