# Release guide

This checklist turns the working copy into a public npm package and GitHub
repository.

## 0. One-time decisions

- **Package name.** Published as `@lihang212010/dsh-multichat`. npm rejected the
  unscoped `dsh-multichat` as too similar to the existing `dsh-multi-chat`.
  If you publish under another account, update `package.json`,
  `cordis.patch.yml`, the `__ModuleLoader__` id in `client.js`, and the install
  commands in both READMEs together.
- **License holder.** `LICENSE` says `Long Laban`. Change it if you publish
  under a different name.
- **Author metadata.** `package.json` sets `author` to `Long Laban`.
- **Screenshots.** Never commit a screenshot that contains a real conversation,
  workspace path, account name or token. Use a clean demo profile.

## 1. Verify the repository metadata

The package already points at `github.com/lihang212010/dsh-multichat`:

```json
"repository": { "type": "git", "url": "git+https://github.com/lihang212010/dsh-multichat.git" },
"homepage": "https://github.com/lihang212010/dsh-multichat#readme",
"bugs": { "url": "https://github.com/lihang212010/dsh-multichat/issues" }
```

If you rename the repository or publish a fork, update all three plus the
`git clone` commands in `README.en.md` and `README.md`. `npm publish` runs
`scripts/check.mjs --publish`, which refuses to continue while the template
`your-github-user` placeholder is present.

## 2. Verify the package

```bash
npm test
npm pack --dry-run
```

Check the file list. It must contain `index.js`, `client.js`,
`cordis.patch.yml`, both locale files, `icon.svg`, `LICENSE`, both READMEs, and
any screenshots referenced by the README.

## 3. Create the Git repository

```bash
git init
git add .
git commit -m "feat: initial release of dsh-multichat"
```

With the GitHub CLI:

```bash
gh repo create dsh-multichat --public --source=. --remote=origin --push
```

Or create an empty repository on github.com, then:

```bash
git remote add origin https://github.com/lihang212010/dsh-multichat.git
git branch -M main
git push -u origin main
```

## 4. Publish to npm

```bash
npm login
npm publish --access public
```

If your default registry is a mirror such as `npmmirror`, `npm login` will try
to log in to that mirror. Mirrors are read-only: they cannot host your package.
The package already pins `publishConfig.registry` to the official registry, but
the login itself must target it explicitly:

```bash
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm publish
```

Alternatively, create an access token on npmjs.com (Access Tokens → Generate
New Token, with publish permission) and add it to `~/.npmrc` without changing
the default install registry:

```ini
//registry.npmjs.org/:_authToken=npm_your_token
```

For a scoped package, replace the name and keep `--access public`.

### Publishing with 2FA

npm requires a second factor for publishes. An account that reports
`two-factor auth: disabled` can still receive:

```text
403 Forbidden - PUT https://registry.npmjs.org/@lihang212010%2Fdsh-multichat -
Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

Use one of these:

- **TOTP** — enable two-factor authentication in the npm account settings, then
  publish with a fresh code:

  ```bash
  npm publish --otp=123456
  ```

- **Granular token with Bypass 2FA** (recommended for repeat releases and CI):
  1. npmjs.com → Access Tokens → Generate New Token → Granular Access Token.
  2. Permissions: **Read and write**; Packages: **All packages**.
  3. Enable **Bypass 2FA**.
  4. Store the token locally, then publish:

     ```bash
     npm config set //registry.npmjs.org/:_authToken npm_your_token
     npm publish
     ```

  For GitHub Actions, save the token as the repository secret `NPM_TOKEN` and
  uncomment the `NODE_AUTH_TOKEN` lines in `.github/workflows/publish.yml`.

Never commit a token. Revoke it immediately if it leaks.

Verify the result:

```bash
npm view @lihang212010/dsh-multichat version
```

## 5. Tag the release

```bash
git tag v0.1.0
git push origin v0.1.0
```

Create a GitHub release from the tag and paste the matching `CHANGELOG.md`
section.

## 6. Automate future releases (optional)

`.github/workflows/publish.yml` publishes on any `v*` tag. Choose one:

- **npm trusted publishing (recommended).** On npmjs.com open the package
  settings → *Trusted publishing* and add this repository plus the workflow
  filename `publish.yml`. The workflow uses GitHub OIDC (`id-token: write`);
  no token secret is needed.
- **npm token.** Create an automation token on npm and add it as the
  `NPM_TOKEN` repository secret. Uncomment the `NODE_AUTH_TOKEN` line in the
  workflow.

With either setup, `npm publish --provenance` attaches a signed provenance
statement to the release.

## 7. Check the install path users will see

On a clean Harness profile:

1. **Plugins → Add plugin → Install a third-party plugin**.
2. Enter `@lihang212010/dsh-multichat`.
3. Confirm that the bundle and plugin rows appear, the icon and localized title
   render, and the split-view button opens the panel.
4. Repeat with the local directory path to confirm source installs still work.

## 8. Versioning

- Patch (`0.1.1`): compatible fixes.
- Minor (`0.2.0`): new user-visible behavior, still compatible with the same
  DSH line.
- Major (`1.0.0`): a change that needs a different DSH client contract, or a
  breaking state/storage migration.

Update `engines.dsh` when you target a different Harness line, and record the
tested Harness version in the README and the GitHub release notes.
