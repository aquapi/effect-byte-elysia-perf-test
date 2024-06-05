import type { TSchema, Static } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

import type { BaseContext, BasicResponse } from '@bit-js/byte';
import { TypeSystemPolicy } from '@sinclair/typebox/system';

TypeSystemPolicy.AllowNaN = true;
TypeSystemPolicy.AllowArrayObject = true;

// Create a validator method from a TypeBox schema to validate request body
export default function schemaValidator<Schema extends TSchema>(schema: Schema): (ctx: BaseContext) => Promise<BasicResponse<string> | Static<Schema>> {
  const compileResult = TypeCompiler.Compile(schema).Code();
  const checkConditions = compileResult.substring(compileResult.indexOf('return (') + 8, compileResult.lastIndexOf(')'));

  return Function(`return async (c)=>{const value=await c.req.json();if(${checkConditions})return value;c.status=403;return c.body("Invalid body format!");}`)();
}
