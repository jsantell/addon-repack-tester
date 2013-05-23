addon-repack-tester
===================

Tests a before and after of a repack of a Firefox addon for differences

### how it works

Compares a list of repacked XPIs (`./repacks`) against the previous XPI (`./xpis`) by first running an instance of Firefox with the previous XPI installed in a new profile and recording stderr. The output is then diffed with the output of Firefox running the repacked XPI installed in a new profile.

The instances of Firefox are run with `cfx run --pkgdir SANDBOX --addons INSTALLED_ADDONS`, where `SANDBOX` is an addon directory with a simple addon that kills Firefox after 1 second, and `INSTALLED_ADDONS` is a directory that the XPIs get moved to to install for testing, and subsequently removed.

All output is streamed to `./results.txt`. Diffs from tmp files or run time are ignored (there are some exceptions). If no diffs are found, the addon has an entry such as:

```
*****vimeo_dimmer-0.2.1-fx.xpi-repacked.xpi: SUCCESS
```

Otherwise the error stack is output:

```
*****vimeo_dimmer-0.2.1-fx.xpi-repacked.xpi: ADDON ERRORS FOUND 
<BEGIN>
-----Using profile at '/tmp/tmpDoZXV2.mozrunner'.
ReferenceError: assignment to undeclared variable instance (resource://jid0-aynesu71xrne     6x3qdnu3mwuhaog-api-utils-lib/securable-module.js -> resource://jid0-aynesu71xrne6x3qdnu     3mwuhaog-api-utils-lib/utils/registry.js:55)
stack:
_destructor@resource://jid0-aynesu71xrne6x3qdnu3mwuhaog-api-utils-lib/securable-module.j     s -> resource://jid0-aynesu71xrne6x3qdnu3mwuhaog-api-utils-lib/utils/registry.js:55
 _destructor@resource://jid0-aynesu71xrne6x3qdnu3mwuhaog-api-utils-lib/securable-module.j     s -> resource://jid0-aynesu71xrne6x3qdnu3mwuhaog-addon-kit-lib/page-mod.js:219

...

<END>
 ```

### false positives

Things that this test will not pick up on:

* errors from using the addon (like clicking on a widget, or navigating to an appropriate site for a page-mod)
* errors that would not occur after initialization and 1 second of running

### false negatives?

Some errors reported are seen as a failure, although these could just be console logs or other debugging (as its all being piped to stderr), and localization errors, etc.

### current status
Found in the wiki
