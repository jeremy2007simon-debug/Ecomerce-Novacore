/**
 * One flag, not a flag system. `ENABLE_STORE_SERVICES` gates a future
 * "collect in store / reserve in store" feature that does not exist yet
 * (planned for the account/services phase). Add the next flag here only
 * when a second one is actually needed — a generic flag framework for a
 * single boolean is exactly the overdesign this project avoids elsewhere.
 */
export const ENABLE_STORE_SERVICES = false;
