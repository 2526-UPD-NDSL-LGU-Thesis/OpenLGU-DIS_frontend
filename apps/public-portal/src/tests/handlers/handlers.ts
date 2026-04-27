// Handlers are functions responsible for intercepting requests and creating mock responses
// This compiles all the handlers.
// This mock handler mirrors real api as best as can for testing purposes
// TODO BUT WHAT DO WE ACTUALLY DO IF DRIFT HAPPENS?

import { qrManagerHandlers } from "#tests/handlers/qrManager.js";

export const handlers = [...qrManagerHandlers];
