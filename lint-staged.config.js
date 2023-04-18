const eslintCmd = "eslint --config ./.eslintrc.js --ignore-pattern '!.*' --fix";
const prettierCmd = "prettier --write --ignore-unknown";

/**
 * @type {{ [glob: string]: (string[] | ((filenames: string[]) => (string[] | Promise<string[]>))) }}}
 * */
const config = {
  "*.{gif,jpeg,jpg,png,svg}": ["imagemin-lint-staged"],
  "*.{js,ts,tsx}": [eslintCmd],
  "**/*": [prettierCmd],
  // TODO [sort-package-json@>=1.49.0] sort-package-json>=1.49.0 bails on sorting scripts if npm-run-all is a dependency, which it is and we use it extensively. 1.52.0 looks like a solve but is not. https://github.com/keithamus/sort-package-json/issues/242
  "**/package.json": ["sort-package-json"],
  "{prettier.config.js,**/package.json}": () => [`${prettierCmd} .`],
  "{.eslintrc.js,**/package.json}": () => [`${eslintCmd} .`],
  "{.*ignore,.gitattributes}": (files) =>
    files.map((file) =>
      [`cat ${file}`, "sort -u", "sed '/^ *$/d'", `sponge ${file}`].join(" | ")
    ),
  "**/Brewfile": (files) =>
    files.map((file) =>
      [
        // Got the idea from https://gist.github.com/mattmc3/e64c58073d6cd64692561d0843ea8ad3
        // TODO This would be great in a brewfile-lint-staged file
        `cat ${file}`,
        `awk 'BEGIN{FS=OFS=" "}
          /^tap/  {print 1 "\t" $0; next}
          /^brew/ {print 2 "\t" $0; next}
          /^cask/ {print 3 "\t" $0; next}
          /^mas/  {print 4 "\t" $0; next}
                  {print 9 "\t" $0}'`,
        "sort -u",
        `awk 'BEGIN{FS="\t";OFS=""}{$1=""; print $0}'`,
        "sed '/^ *$/d'",
        `sponge ${file}`,
      ].join(" | ")
    ),
};

module.exports = config;
