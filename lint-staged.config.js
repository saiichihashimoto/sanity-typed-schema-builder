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
  ...(process.env.NO_FIX
    ? {}
    : {
        "{.env*,.gitattributes}": (files) =>
          files.map((file) => `sort -o ${file} ${file}`),
        Brewfile: (files) =>
          files.map((file) =>
            [
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
      }),
};

module.exports = config;
