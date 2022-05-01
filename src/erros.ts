class ExistingNameError extends Error {
  constructor(name: string) {
    super(`name: "${name}" already exists. Name must be unique.`);
    this.name = "ExistingNameError";
  }
}

class StateNotPaginatedError extends Error {
  constructor(expectedPaginatedArrayName: string) {
    super(
      `State marked as paginated, but could not find the Paginated Array Attribute Name (${expectedPaginatedArrayName}) in the state object. Maybe its not a Paginated State.`
    );
    this.name = "StateNotPaginatedError";
  }
}

class StateNotAArrayError extends Error {
  constructor() {
    super("State marked as Array, but is not. Maybe its a paginated State.");
    this.name = "StateNotAArrayError";
  }
}

class PayloadHasNoAttributeError extends Error {
  constructor(expectedPayloadIdName: string) {
    super(
      `Payload: object has no attribute "${expectedPayloadIdName}". You can configure a custom attribute name.`
    );
    this.name = "PayloadHasNoAttributeError";
  }
}

class WorngPayloadIdTypeError extends Error {
  constructor() {
    super(`Received worng Payload Id Type.`);
    this.name = "WorngPayloadIdTypeError";
  }
}
