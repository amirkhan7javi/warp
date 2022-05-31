import {
  ArrayType,
  ElementaryTypeName,
  Expression,
  FixedBytesType,
  generalizeType,
  getNodeType,
  IntType,
  PointerType,
  typeNameToTypeNode,
  TupleType,
  VariableDeclaration,
  FunctionType,
  MappingType,
  TypeNameType,
  TypeNode,
  TypeName,
  IndexAccess,
  Literal,
  IntLiteralType,
} from 'solc-typed-ast';
import { AST } from '../ast/ast';
import { ASTMapper } from '../ast/mapper';
import { createCairoFunctionStub, createCallToFunction } from '../utils/functionGeneration';
import { generateExpressionTypeString } from '../utils/getTypeString';
import { typeNameFromTypeNode } from '../utils/utils';
import {
  createNumberLiteral,
  createUint8TypeName,
  createUint256TypeName,
} from '../utils/nodeTemplates';

/* Convert fixed-size byte arrays (e.g. bytes2, bytes8) to their equivalent unsigned integer.
    This pass currently does not handle dynamically-sized bytes arrays (i.e. bytes).
*/

export class BytesConverter extends ASTMapper {
  visitExpression(node: Expression, ast: AST): void {
    const typeNode = getNodeType(node, ast.compilerVersion);
    if (!(typeNode instanceof IntLiteralType)) {
      node.typeString = generateExpressionTypeString(replaceFixedBytesType(typeNode));
    }
    this.commonVisit(node, ast);
  }

  visitVariableDeclaration(node: VariableDeclaration, ast: AST): void {
    const typeNode = replaceFixedBytesType(getNodeType(node, ast.compilerVersion));
    node.typeString = generateExpressionTypeString(typeNode);
    this.commonVisit(node, ast);
  }

  visitElementaryTypeName(node: ElementaryTypeName, ast: AST): void {
    const typeNode = typeNameToTypeNode(node);
    const replacementTypeNode = replaceFixedBytesType(typeNode);
    if (typeNode.pp() !== replacementTypeNode.pp()) {
      const typeString = replacementTypeNode.pp();
      node.typeString = typeString;
      node.name = typeString;
    }
    this.commonVisit(node, ast);
  }

  visitIndexAccess(node: IndexAccess, ast: AST): void {
    if (
      !(
        node.vIndexExpression &&
        generalizeType(getNodeType(node.vBaseExpression, ast.compilerVersion))[0] instanceof
          FixedBytesType &&
        getNodeType(node, ast.compilerVersion) instanceof FixedBytesType
      )
    ) {
      this.visitExpression(node, ast);
      return;
    }

    const baseTypeName = typeNameFromTypeNode(
      getNodeType(node.vBaseExpression, ast.compilerVersion),
      ast,
    );

    const width: string = baseTypeName.typeString.slice(5);

    const indexTypeName =
      node.vIndexExpression instanceof Literal
        ? createUint256TypeName(ast)
        : typeNameFromTypeNode(getNodeType(node.vIndexExpression, ast.compilerVersion), ast);

    const functionStub = createCairoFunctionStub(
      selectWarplibFunction(baseTypeName, indexTypeName),
      [
        ['base', baseTypeName],
        ['index', indexTypeName],
        ['width', createUint8TypeName(ast)],
      ],
      [['res', createUint8TypeName(ast)]],
      ['bitwise_ptr', 'range_check_ptr'],
      ast,
      node,
    );
    const call = createCallToFunction(
      functionStub,
      [node.vBaseExpression, node.vIndexExpression, createNumberLiteral(width, ast, 'uint8')],
      ast,
    );

    ast.registerImport(
      call,
      'warplib.maths.bytes_access',
      selectWarplibFunction(baseTypeName, indexTypeName),
    );
    ast.replaceNode(node, call, node.parent);
    const typeNode = replaceFixedBytesType(getNodeType(call, ast.compilerVersion));
    call.typeString = generateExpressionTypeString(typeNode);
    this.commonVisit(call, ast);
  }

  visitTypeName(node: TypeName, ast: AST): void {
    const typeNode = getNodeType(node, ast.compilerVersion);
    const replacementTypeNode = replaceFixedBytesType(typeNode);
    if (typeNode.pp() !== replacementTypeNode.pp()) {
      const typeString = replacementTypeNode.pp();
      node.typeString = typeString;
    }
    this.commonVisit(node, ast);
  }
}

function replaceFixedBytesType(type: TypeNode): TypeNode {
  if (type instanceof ArrayType) {
    return new ArrayType(replaceFixedBytesType(type.elementT), type.size, type.src);
  } else if (type instanceof FixedBytesType) {
    return new IntType(type.size * 8, false, type.src);
  } else if (type instanceof FunctionType) {
    return new FunctionType(
      type.name,
      type.parameters.map(replaceFixedBytesType),
      type.returns.map(replaceFixedBytesType),
      type.visibility,
      type.mutability,
      type.src,
    );
  } else if (type instanceof MappingType) {
    return new MappingType(
      replaceFixedBytesType(type.keyType),
      replaceFixedBytesType(type.valueType),
      type.src,
    );
  } else if (type instanceof PointerType) {
    return new PointerType(replaceFixedBytesType(type.to), type.location, type.kind, type.src);
  } else if (type instanceof TupleType) {
    return new TupleType(type.elements.map(replaceFixedBytesType), type.src);
  } else if (type instanceof TypeNameType) {
    return new TypeNameType(replaceFixedBytesType(type.type), type.src);
  } else {
    return type;
  }
}

function selectWarplibFunction(baseTypeName: TypeName, indexTypeName: TypeName): string {
  if (indexTypeName.typeString === 'uint256' && baseTypeName.typeString === 'bytes32') {
    return 'byte256_at_index_uint256';
  }
  if (indexTypeName.typeString === 'uint256') {
    return 'byte_at_index_uint256';
  }
  if (baseTypeName.typeString === 'bytes32') {
    return 'byte256_at_index';
  }
  return 'byte_at_index';
}