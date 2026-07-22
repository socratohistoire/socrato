import { createHmac } from "node:crypto";

export interface AccessCodeLookup {
  digest(normalizedCode: string): string;
}

export class HmacAccessCodeLookup implements AccessCodeLookup {
  constructor(private readonly key: string) {
    if (key.length === 0) {
      throw new Error("Student access lookup key is required.");
    }
  }

  digest(normalizedCode: string): string {
    return createHmac("sha256", this.key).update(normalizedCode).digest("hex");
  }
}
