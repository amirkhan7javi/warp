import assert = require('assert');
import {
  ArrayType,
  Assignment,
  BinaryOperation,
  ElementaryTypeName,
  ElementaryTypeNameExpression,
  Expression,
  FunctionCall,
  FunctionCallKind,
  FunctionType,
  getNodeType,
  PointerType,
  Return,
  StructDefinition,
  TupleType,
  TypeNameType,
  TypeNode,
  UserDefinedType,
  UserDefinedTypeName,
  VariableDeclarationStatement,
} from 'solc-typed-ast';
import { AST } from '../ast/ast';
import { ASTMapper } from '../ast/mapper';
import { printNode, printTypeNode } from '../utils/astPrinter';
import { NotSupportedYetError } from '../utils/errors';
import { error } from '../utils/formatting';
import { compareTypeSize, dereferenceType } from '../utils/utils';

// TODO conclusively handle all edge cases
// TODO for example operations between literals and non-literals truncate the literal,
// they do not upcast the non-literal

export class ImplicitConversionToExplicit extends ASTMapper {
  generateExplicitConversion(typeTo: string, expression: Expression, ast: AST): FunctionCall {
    return new FunctionCall(
      ast.reserveId(),
      expression.src,
      'FunctionCall',
      typeTo,
      FunctionCallKind.TypeConversion,
      new ElementaryTypeNameExpression(
        ast.reserveId(),
        expression.src,
        'ElementaryTypeNameExpression',
        `type(${typeTo})`,
        new ElementaryTypeName(
          ast.reserveId(),
          expression.src,
          'ElementaryTypeName',
          typeTo,
          typeTo,
        ),
      ),
      [expression],
    );
  }

  visitReturn(node: Return, ast: AST): void {
    this.commonVisit(node, ast);

    const funcDef = node.vFunctionReturnParameters.vParameters;

    if (node.vExpression == undefined) return;

    // Return type should be a single value
    if (funcDef.length > 1) return;

    // TODO test tuple of structs
    if (node.vExpression.typeString.startsWith('tuple(')) return;

    // Skip enums - implicit conversion is not allowed
    if (funcDef[0].typeString.startsWith('enum ')) return;

    // TODO handle or rule out implicit conversions of structs
    if (funcDef[0].vType instanceof UserDefinedTypeName) return;
    else {
      const retParamType = dereferenceType(
        getNodeType(node.vFunctionReturnParameters.vParameters[0], ast.compilerVersion),
      );
      const retValueType = dereferenceType(getNodeType(node.vExpression, ast.compilerVersion));
      const res = compareTypeSize(retParamType, retValueType);

      if (res == 1) {
        const castedReturnExp = this.generateExplicitConversion(
          funcDef[0].typeString,
          node.vExpression,
          ast,
        );
        node.vExpression = castedReturnExp;
        ast.registerChild(castedReturnExp, node);
      }
    }
    return;
  }

  visitBinaryOperation(node: BinaryOperation, ast: AST): void {
    this.commonVisit(node, ast);

    if (node.operator === '<<' || node.operator === '>>') return;

    const argTypes = [node.vLeftExpression, node.vRightExpression].map((v) =>
      getNodeType(v, ast.compilerVersion),
    );
    const res = compareTypeSize(argTypes[0], argTypes[1]);

    if (res === -1) {
      // argTypes[1] > argTypes[0]
      node.vLeftExpression = this.generateExplicitConversion(
        argTypes[1].pp(),
        node.vLeftExpression,
        ast,
      );
      ast.registerChild(node.vLeftExpression, node);
    } else if (res === 1) {
      // argTypes[0] > argTypes[1]
      node.vRightExpression = this.generateExplicitConversion(
        argTypes[0].pp(),
        node.vRightExpression,
        ast,
      );
      ast.registerChild(node.vRightExpression, node);
    }
  }

  // Implicit conversions are not deep
  // e.g. int32 = int16 + int8 -> int32 = int32(int16 + int16(int8)), not int32(int16) + int32(int8)
  // Handle signedness conversions (careful about difference between 0.7.0 and 0.8.0)

  visitAssignment(node: Assignment, ast: AST): void {
    this.commonVisit(node, ast);

    const childrenTypes = [node.vLeftHandSide, node.vRightHandSide].map((v) =>
      getNodeType(v, ast.compilerVersion),
    );
    const res = compareTypeSize(childrenTypes[0], childrenTypes[1]);
    if (res === 1) {
      // sizeof(lhs) > sizeof(rhs)
      node.vRightHandSide = this.generateExplicitConversion(
        childrenTypes[0].pp(),
        node.vRightHandSide,
        ast,
      );
      ast.registerChild(node.vRightHandSide, node);
    }
    return;
  }

  visitVariableDeclarationStatement(node: VariableDeclarationStatement, ast: AST): void {
    this.commonVisit(node, ast);

    assert(
      node.vInitialValue !== undefined,
      'Implicit conversion to explicit expects variables to be initialised (did you run variable declaration initialiser?)',
    );
    // Assuming all variable declarations are split and have an initial value

    // VariableDeclarationExpressionSplitter must be run before this pass
    const initialValType = getNodeType(node.vInitialValue, ast.compilerVersion);
    if (initialValType instanceof TupleType || initialValType instanceof PointerType) {
      return;
    }

    const declaration = node.vDeclarations[0];

    // Skip enums - implicit conversion is not allowed
    if (declaration.typeString.startsWith('enum ')) {
      return;
    }

    // TODO handle or rule out implicit conversions of structs
    if (declaration.vType instanceof UserDefinedTypeName) {
      return;
    }

    const declarationType = getNodeType(declaration, ast.compilerVersion);

    const res = compareTypeSize(declarationType, initialValType);

    if (res === 1) {
      node.vInitialValue = this.generateExplicitConversion(
        declarationType.pp(),
        node.vInitialValue,
        ast,
      );
      ast.registerChild(node.vInitialValue, node);
    }

    return;
  }

  visitFunctionCall(node: FunctionCall, ast: AST): void {
    if (node.fieldNames !== undefined) {
      throw new NotSupportedYetError(`Functions with named arguments are not supported yet`);
    }
    this.commonVisit(node, ast);

    if (
      node.kind === FunctionCallKind.TypeConversion ||
      node.vReferencedDeclaration === undefined
    ) {
      return;
    }

    if (node.kind === FunctionCallKind.StructConstructorCall) {
      this.visitStructConstructorArguments(node, ast);
    } else {
      this.visitFunctionCallArguments(node, ast);
    }
  }

  visitStructConstructorArguments(node: FunctionCall, ast: AST): void {
    const structType = getNodeType(node.vExpression, ast.compilerVersion);
    assert(
      structType instanceof TypeNameType &&
        structType.type instanceof PointerType &&
        structType.type.to instanceof UserDefinedType,
      error(
        `TypeNode for ${printNode(
          node.vExpression,
        )} was expected to be a TypeNameType(PointerType(UserDefinedType, storage)), got ${printTypeNode(
          structType,
          true,
        )}`,
      ),
    );
    const structDef = structType.type.to.definition;
    assert(structDef instanceof StructDefinition);
    const parameters = structDef.vMembers;
    node.vArguments.forEach((arg, idx) =>
      this.processArgumentConversion(
        node,
        getNodeType(parameters[idx], ast.compilerVersion),
        arg,
        ast,
      ),
    );
  }

  visitFunctionCallArguments(node: FunctionCall, ast: AST): void {
    const functionType = getNodeType(node.vExpression, ast.compilerVersion);
    assert(
      functionType instanceof FunctionType,
      error(
        `TypeNode for ${printNode(
          node.vExpression,
        )} was expected to be a FunctionType, got ${printTypeNode(functionType, true)}`,
      ),
    );

    const parameters = functionType.parameters;

    node.vArguments.forEach((arg, idx) =>
      this.processArgumentConversion(node, parameters[idx], arg, ast),
    );
  }

  processArgumentConversion(
    func: FunctionCall,
    paramType: TypeNode,
    arg: Expression,
    ast: AST,
  ): void {
    const rawArgType = getNodeType(arg, ast.compilerVersion);
    if (rawArgType instanceof PointerType || rawArgType instanceof ArrayType) {
      // TODO do this properly when implementing storage <-> memory
      return;
    }
    const argumentType = dereferenceType(rawArgType);
    const nonPtrParamType = dereferenceType(paramType);

    // Skip enums - implicit conversion is not allowed
    if (nonPtrParamType.pp().startsWith('enum ')) {
      return;
    }

    const res = compareTypeSize(argumentType, nonPtrParamType);
    if (res !== 0) {
      ast.replaceNode(arg, this.generateExplicitConversion(paramType.pp(), arg, ast), func);
    }
  }
}