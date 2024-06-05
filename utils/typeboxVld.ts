import type { TSchema, Static } from '@sinclair/typebox';
import { TypeCompiler } from '@sinclair/typebox/compiler';

import type { BaseContext, BasicResponse } from '@bit-js/byte';
import { TypeSystemPolicy } from '@sinclair/typebox/system';

TypeSystemPolicy.AllowNaN = true;
TypeSystemPolicy.AllowArrayObject = true;

// Quick error catching
function noop() { return null; }

// Create a validator method from a TypeBox schema to validate request body
export default function schemaValidator<Schema extends TSchema>(schema: Schema) {
  const compileResult = TypeCompiler.Compile(schema);

  return async (ctx: BaseContext): Promise<BasicResponse<string> | Static<Schema>> => {
    const body = await ctx.req.json().catch(noop);
    if (body === null) {
      ctx.status = 403;
      return ctx.body('Invalid body format!');
    }

    const errorValue = compileResult.Errors(body).First();
    if (errorValue === undefined) return body;

    ctx.status = 403;
    return ctx.body(errorValue.message);
  };
}
