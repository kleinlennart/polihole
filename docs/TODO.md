# TODO

- allow up or downvote on words?

- add notebooks/ to github page?

- look at the update band in a browser — never actually seen it. load the preview, reload once by hand so the page has the toast code, *then* rebuild and watch it drop in. check it against `flash-invert` too: that's a filter on `<main>` and the band is a sibling, so it stays black while the card inverts.

- stop docs-only pushes asking everyone to reload: next stamps a random build id into three asset paths, so every build is a new cache name, and deploy.yml has no path filter. either a constant `generateBuildId` in next.config.ts or `paths-ignore` on the workflow.

- add quiz
