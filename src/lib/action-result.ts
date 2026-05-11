/**
 * Standard return shape for server actions.
 *
 * Pick one of:
 *   - return { ok: true } / { ok: true, data }
 *   - return { ok: false, error } / { ok: false, error, fields }
 *
 * Existing actions return mixed shapes ({ error, success, redirectTo, ... }).
 * Don't refactor every action up-front — incrementally adopt this type on
 * new actions and when touching old ones. Callers can branch on `result.ok`
 * for an exhaustive check.
 */

export type ActionResult<TData = void> =
  | (TData extends void ? { ok: true } : { ok: true; data: TData })
  | {
      ok: false;
      error: string;
      /** Field-level validation errors keyed by form field name. */
      fields?: Record<string, string>;
    };

export function ok(): ActionResult<void>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T> {
  if (data === undefined) {
    return { ok: true } as ActionResult<T>;
  }
  return { ok: true, data } as ActionResult<T>;
}

export function fail(
  error: string,
  fields?: Record<string, string>
): ActionResult<never> {
  if (fields) return { ok: false, error, fields };
  return { ok: false, error };
}
