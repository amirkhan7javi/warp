import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs-extra';

if (!existsSync('./tests/behaviour/8/solidity')) {
  execSync('bash ./tests/behaviour/setup.sh');
}

const filters = [
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/abiEncoderV1',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/abiEncoderV1/cleanup',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/abiEncoderV1/struct',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/abiEncoderV2',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/abiEncoderV2/cleanup',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/abiEncoderV2/struct',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/abiencodedecode',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/accessor',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/arithmetics',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array/concat',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array/copying',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array/delete',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array/indexAccess',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array/pop',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array/push',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/array/slices',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/asmForLoop',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/builtinFunctions',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/calldata',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/cleanup',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/constantEvaluator',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/constants',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/constructor',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/conversions',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/ecrecover',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/enums',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/error',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/errors',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/events',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/exponentiation',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/expressions',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalContracts',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalContracts/_prbmath',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalContracts/_stringutils',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_external',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_external/subdir',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_non_normalized_paths',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_relative_imports',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_relative_imports/D',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_relative_imports/dir',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_relative_imports/dir/B',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_relative_imports/dir/G',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_source_name_starting_with_dots',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/externalSource/_source_name_starting_with_dots/dir',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/fallback',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/freeFunctions',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/functionCall',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/functionCall/inheritance',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/functionSelector',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/functionTypes',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/getters',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/immutable',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/inheritance',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/inlineAssembly',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/integer',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/interfaceID',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/isoltestTesting',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/isoltestTesting/storage',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/libraries',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/literals',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/memoryManagement',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/metaTypes',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/modifiers',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/multiSource',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/operators',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/operators/shifts',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/optimizer',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/payable',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/receive',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/revertStrings',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/reverts',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/salted_create',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/smoke',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/specialFunctions',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/state',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/statements',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/storage',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/strings',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/strings/concat',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/structs',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/structs/calldata',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/structs/conversion',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/tryCatch',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/types',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/types/mapping',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/underscore',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/uninitializedFunctionPointer',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/userDefinedValueType',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/variables',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/various',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/viaYul',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/viaYul/array_memory_allocation',

  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/viaYul/cleanup',
  // 'tests/behaviour/8/solidity/test/libsolidity/semanticTests/viaYul/conditional',

  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/viaYul/conversion',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/viaYul/loops',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/viaYul/storage',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests/virtualFunctions',
  'tests/behaviour/8/solidity/test/libsolidity/semanticTests',
];

const whitelistPath = './tests/behaviour/expectations/semantic_whitelist.ts';
const whitelistData = readFileSync(whitelistPath, 'utf-8');

function uncommentTests(filter: string): void {
  writeFileSync(
    whitelistPath,
    whitelistData
      .split('\n')
      .map((line): string => {
        const trimmed = line.trim();
        if (
          trimmed.startsWith(`// '`) &&
          trimmed.includes(filter) &&
          !trimmed.slice(`// '${filter}/`.length).includes('/')
        ) {
          return line.replace('//', '');
        } else {
          return line;
        }
      })
      .join('\n'),
  );
}

filters.forEach((filter) => {
  uncommentTests(filter);
  console.log('------------------------------------------------------');
  try {
    execSync(
      `FILTER=${filter} npx mocha tests/behaviour/behaviour.test.ts --extension ts --require ts-node/register --exit`,
      { stdio: 'inherit' },
    );
  } catch (e) {
    console.log(e);
  }
});

writeFileSync(whitelistPath, whitelistData);
