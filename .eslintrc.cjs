const defaultSeverity = 'warn';

module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {},
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
        'plugin:prettier/recommended',
        'plugin:react/recommended',
        'plugin:import/typescript'
    ],
    plugins: ['@typescript-eslint', 'import', 'prettier', 'react', 'react-hooks', 'unused-imports'],
    env: {
        es6: true,
        browser: true,
        node: true
    },
    ignorePatterns: ['**/build/**/*', '**/dist/**/*', '**/lib/**/*', '**/docs/**/*', '**/node_modules/**/*'],

    rules: {
        // https://eslint.org/docs/rules/comma-dangle
        'comma-dangle': defaultSeverity,
        // https://eslint.org/docs/rules/curly
        'curly': defaultSeverity,
        // https://eslint.org/docs/rules/grouped-accessor-pairs
        'grouped-accessor-pairs': [defaultSeverity, 'getBeforeSet'],
        // https://eslint.org/docs/rules/jsx-quotes
        'jsx-quotes': defaultSeverity,
        // https://eslint.org/docs/rules/key-spacing
        'key-spacing': defaultSeverity,
        // https://eslint.org/docs/rules/no-bitwise
        'no-bitwise': defaultSeverity,
        // https://eslint.org/docs/rules/no-console
        'no-console': [
            defaultSeverity,
            {
                allow: ['warn', 'error']
            }
        ],
        // https://eslint.org/docs/rules/no-dupe-class-members
        'no-dupe-class-members': 'off',
        // https://eslint.org/docs/rules/no-var
        'no-var': defaultSeverity,
        // https://eslint.org/docs/rules/quote-props
        'quote-props': [defaultSeverity, 'consistent-as-needed'],
        // https://eslint.org/docs/rules/quotes
        'quotes': [
            defaultSeverity,
            'single',
            {
                avoidEscape: true
            }
        ],
        // https://eslint.org/docs/rules/semi-spacing
        'semi-spacing': defaultSeverity,
        // https://eslint.org/docs/rules/sort-imports
        'sort-imports': [
            defaultSeverity,
            {
                ignoreDeclarationSort: true
            }
        ],

        // https://github.com/import-js/eslint-plugin-import/blob/master/docs/rules/no-anonymous-default-export.md
        'import/no-anonymous-default-export': 'off',
        // https://github.com/import-js/eslint-plugin-import/blob/master/docs/rules/no-cycle.md
        'import/no-cycle': [
            // TODO: Turn this on once we have a better way of handling cyclical dependencies
            // We currently have over 400 warnings 💀
            // defaultSeverity,
            'off',
            {
                ignoreExternal: true,
                maxDepth: 30
            }
        ],
        // https://github.com/import-js/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md
        'import/no-duplicates': defaultSeverity,
        // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
        'import/no-extraneous-dependencies': defaultSeverity,
        // https://github.com/import-js/eslint-plugin-import/blob/master/docs/rules/order.md
        'import/order': [
            defaultSeverity,
            {
                'alphabetize': {
                    order: 'asc',
                    caseInsensitive: true
                },
                'groups': ['builtin', 'external', 'internal', 'parent', ['index', 'sibling'], 'unknown'],
                'newlines-between': 'always'
            }
        ],

        // https://github.com/prettier/eslint-plugin-prettier#options
        'prettier/prettier': [
            defaultSeverity,
            {
                printWidth: 140,
                proseWrap: 'always',
                quoteProps: 'consistent',
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'none',
                useTabs: false
            }
        ],

        // https://github.com/sweepline/eslint-plugin-unused-imports/blob/master/docs/rules/no-unused-imports.md
        'unused-imports/no-unused-imports': defaultSeverity,

        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-types.md
        '@typescript-eslint/ban-types': [
            defaultSeverity,
            {
                types: {
                    Object: {
                        message: 'Avoid using the `Object` type. Did you mean `object`?',
                        fixWith: 'object'
                    },
                    Boolean: {
                        message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
                        fixWith: 'boolean'
                    },
                    Number: {
                        message: 'Avoid using the `Number` type. Did you mean `number`?',
                        fixWith: 'number'
                    },
                    String: {
                        message: 'Avoid using the `String` type. Did you mean `string`?',
                        fixWith: 'string'
                    },
                    Symbol: {
                        message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
                        fixWith: 'symbol'
                    }
                },
                extendDefaults: false
            }
        ],
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-ts-comment.md
        '@typescript-eslint/ban-ts-comment': 'off',
        // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/consistent-type-imports.md
        '@typescript-eslint/consistent-type-imports': defaultSeverity,
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-member-accessibility.md
        '@typescript-eslint/explicit-member-accessibility': [
            defaultSeverity,
            {
                accessibility: 'explicit',
                overrides: {
                    constructors: 'no-public'
                }
            }
        ],
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/explicit-function-return-type.md
        '@typescript-eslint/explicit-function-return-type': 'off',
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
        '@typescript-eslint/indent': 'off',
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/member-ordering.md
        '@typescript-eslint/member-ordering': [
            defaultSeverity,
            {
                default: {
                    memberTypes: [
                        // Fields
                        'public-static-field',
                        'public-field',
                        'protected-static-field',
                        'protected-field',
                        'private-static-field',
                        'private-field',
                        // Constructors
                        'public-constructor',
                        'protected-constructor',
                        'private-constructor',
                        // Getters & Setters
                        ['public-get', 'public-set'],
                        ['protected-get', 'protected-set'],
                        ['private-get', 'private-set'],
                        // Index signatures
                        'signature',
                        // Methods
                        'public-static-method',
                        'public-method',
                        'protected-static-method',
                        'protected-method',
                        'private-static-method',
                        'private-method'
                    ],
                    order: 'alphabetically'
                }
            }
        ],
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md
        '@typescript-eslint/naming-convention': [
            defaultSeverity,
            // Enforce that private properties are prefixed with an underscore
            {
                selector: 'property',
                modifiers: ['private'],
                format: ['camelCase'],
                leadingUnderscore: 'require'
            },
            // Forbid I-prefixed interfaces
            {
                selector: 'interface',
                format: ['PascalCase'],
                custom: {
                    regex: '^I[A-Z]',
                    match: false
                }
            }
        ],
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-empty-interface.md
        '@typescript-eslint/no-empty-interface': 'off',
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-explicit-any.md
        '@typescript-eslint/no-explicit-any': 'off',
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-inferrable-types.md
        '@typescript-eslint/no-inferrable-types': [
            defaultSeverity,
            {
                ignoreParameters: true,
                ignoreProperties: true
            }
        ],
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-unused-vars.md
        '@typescript-eslint/no-unused-vars': 'off',
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/triple-slash-reference.md
        '@typescript-eslint/triple-slash-reference': 'off'
    },
    overrides: [
        {
            files: ['**/src/**/*'],
            rules: {
                // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
                'import/no-extraneous-dependencies': [
                    defaultSeverity,
                    {
                        // Allow devDependencies to be used for scripts outside "src" folders.
                        devDependencies: true
                    }
                ]
            }
        },
        {
            files: ['*.tsx'],
            rules: {
                // https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prop-types.md
                'react/prop-types': 'off',
                // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md
                'react/react-in-jsx-scope': 'off'
            }
        }
    ]
};
