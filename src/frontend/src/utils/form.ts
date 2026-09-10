/** Ant Design Form.Item `validateStatus` for a field error flag. */
export function validationStatus(hasError: boolean): 'error' | undefined {
  return hasError ? 'error' : undefined;
}
