## Testing Capabilities

**Strict TDD Mode**: disabled
**Detected**: 2026-06-09

### Test Runner

No test runner is installed. The project has no Jest, Vitest, or testing-library setup.
Test commands have not been defined in `package.json`.

### Test Layers

| Layer       | Available | Tool   |
| ----------- | --------- | ------ |
| Unit        | ❌        | —      |
| Integration | ❌        | —      |
| E2E         | ❌        | —      |

### Coverage

- Available: ❌
- Command: —

### Quality Tools

| Tool         | Available | Command |
| ------------ | --------- | ------- |
| Linter       | ❌        | —       |
| Type checker | ✅        | tsc (via expo TypeScript check) |
| Formatter    | ❌        | —       |

### Notes

- `strict_tdd` is false because no test runner exists.
- The project uses TypeScript's strict mode (`strict: true`, `noUncheckedIndexedAccess: true`) in `tsconfig.json`.
- A test runner should be configured before enabling TDD workflows.
- Recommended: Vitest + @testing-library/react-native as the test stack when introduced.
