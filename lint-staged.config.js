const prettierCmd = "prettier --write --ignore-unknown";

/**
 * @type {{ [glob: string]: (string[] | ((filenames: string[]) => (string[] | Promise<string[]>))) }}}
 * */
const config = {
  "*.{gif,jpeg,jpg,png,svg}": ["imagemin-lint-staged"],
  "**/*": [prettierCmd],
  // TODO [sort-package-json@>=1.49.0] sort-package-json>=1.49.0 bails on sorting scripts if npm-run-all is a dependency, which it is and we use it extensively. 1.52.0 looks like a solve but is not. https://github.com/keithamus/sort-package-json/issues/242
  "**/package.json": ["sort-package-json"],
  "{.*ignore,.gitattributes}": (files) =>
    files.map((file) =>
      [`cat ${file}`, "sort -u", "sed '/^ *$/d'", `sponge ${file}`].join(" | ")
    ),
};

module.exports = config;
