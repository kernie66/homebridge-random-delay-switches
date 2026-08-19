// Converts error from catch block to a string message for logging and debugging purposes

export default function getErrorMessage(error?: unknown) {
  let errorMessage = 'unknown error';

  if (typeof error === 'string') {
    errorMessage = error;
  }
  if (error instanceof Error) {
    errorMessage = `${error.name}: ${error.message}`;
  }
  return errorMessage;
}
