import { BinaryOperation } from 'solc-typed-ast';
import { AST } from '../../../ast/ast';
import { Implicits } from '../../../utils/implicits';
import { mapRange } from '../../../utils/utils';
import { forAllWidths, generateFile, IntxIntFunction } from '../../utils';

export function mod() {
  generateFile(
    'mod',
    [
      `from starkware.cairo.common.uint256 import Uint256, uint256_unsigned_div_rem`,
      `from warplib.types.uints import ${mapRange(31, (n) => `Uint${8 * n + 8}`)}`,
      `from warplib.maths.int_conversions import ${mapRange(
        31,
        (n) => `warp_uint${8 * n + 8}_to_uint256`,
      ).join(', ')}`,
      ``,
      `const SHIFT = 2 ** 128`,
    ],
    forAllWidths((width) => {
      if (width == 256) {
        return [
          `func warp_mod256{range_check_ptr}(lhs : Uint256, rhs : Uint256) -> (res : Uint256):`,
          `    if rhs.high == 0:`,
          `        if rhs.low == 0:`,
          `            with_attr error_message("Modulo by zero error"):`,
          `                assert 1 = 0`,
          `            end`,
          `        end`,
          `    end`,
          `    let (_, res : Uint256) = uint256_unsigned_div_rem(lhs, rhs)`,
          `    return (res)`,
          `end`,
        ];
      } else {
        return [
          `func warp_mod${width}{range_check_ptr}(lhs : Uint${width}, rhs : Uint${width}) -> (res : Uint${width}):`,
          `    if rhs.value == 0:`,
          `        with_attr error_message("Modulo by zero error"):`,
          `            assert 1 = 0`,
          `        end`,
          `    end`,
          `    let (lhs_256) = warp_uint${width}_to_uint256(lhs)`,
          `    let (rhs_256) = warp_uint${width}_to_uint256(rhs)`,
          `    let (_, res256) = uint256_unsigned_div_rem(lhs_256, rhs_256)`,
          `    let res_felt = res256.low + SHIFT * res256.high`,
          `    return (Uint${width}(value = res_felt))`,
          `end`,
        ];
      }
    }),
  );
}

export function mod_signed() {
  generateFile(
    'mod_signed',
    [
      'from starkware.cairo.common.bitwise import bitwise_and',
      'from starkware.cairo.common.cairo_builtins import BitwiseBuiltin',
      'from starkware.cairo.common.uint256 import Uint256, uint256_signed_div_rem, uint256_eq',
      `from warplib.types.ints import ${mapRange(32, (n) => `Int${8 * n + 8}`)}`,
      `from warplib.maths.int_conversions import ${mapRange(
        31,
        (n) => `warp_int${8 * n + 8}_to_uint256`,
      ).join(', ')}, ${mapRange(31, (n) => `warp_uint256_to_int${8 * n + 8}`).join(', ')}`,
    ],
    forAllWidths((width) => {
      if (width === 256) {
        return [
          'func warp_mod_signed256{range_check_ptr}(lhs : Int256, rhs : Int256) -> (res : Int256):',
          `    if rhs.value.high == 0:`,
          `       if rhs.value.low == 0:`,
          `           with_attr error_message("Modulo by zero error"):`,
          `             assert 1 = 0`,
          `           end`,
          `       end`,
          `    end`,
          '    let (_, res : Uint256) = uint256_signed_div_rem(lhs.value, rhs.value)',
          '    return (Int256(value=res))',
          'end',
        ];
      } else {
        return [
          `func warp_mod_signed${width}{range_check_ptr, bitwise_ptr: BitwiseBuiltin*}(lhs : Int${width}, rhs : Int${width}) -> (res : Int${width}):`,
          `    alloc_locals`,
          `    if rhs.value == 0:`,
          `        with_attr error_message("Modulo by zero error"):`,
          `            assert 1 = 0`,
          `        end`,
          `    end`,
          `    let (local lhs_256) = warp_int${width}_to_uint256(lhs)`,
          `    let (rhs_256) = warp_int${width}_to_uint256(rhs)`,
          '    let (_, res256) = uint256_signed_div_rem(lhs_256, rhs_256)',
          `    let (truncated) = warp_uint256_to_int${width}(res256)`,
          `    return (truncated)`,
          'end',
        ];
      }
    }),
  );
}

export function functionaliseMod(node: BinaryOperation, ast: AST): void {
  const implicits = (width: number, signed: boolean): Implicits[] => {
    if (width !== 256 && signed) return ['range_check_ptr', 'bitwise_ptr'];
    return ['range_check_ptr'];
  };
  IntxIntFunction(node, 'mod', 'always', true, false, implicits, ast);
}
