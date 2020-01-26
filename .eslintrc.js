module.exports = {
    "extends": [
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
      ],
    "rules": {
        "no-non-null-assertion": 0,
        "@typescript-eslint/member-delimiter-style": ["error", {
          multiline: {
            delimiter: 'comma',
            requireLast: true,
          },
          singleline: {
            delimiter: 'comma',
            requireLast: false,
          },
          overrides: {
              interface: {
                  multiline: {
                      delimiter: 'semi',
                      requireLast: false
                  },
                  singleline: {
                      delimiter: 'semi',
                      requireLast: false
                  }
              }
          }
        }]
    }
}
