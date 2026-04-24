# Security Specification - Laureen Ratinckx Portfolio

## 1. Data Invariants
- An `Album` must have a valid category from the allowed list.
- A `Photo` must belong to an existing `Album`.
- Only the administrator (laureen.ratinckx@gmail.com) can create, update, or delete albums, photos, and reviews.
- Public users can only read (list/get) albums, photos, and reviews.
- Contact messages can be created by anyone but read only by the admin.

## 2. The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Write**: Attempting to create an album without logging in.
2. **Identity Spoofing**: Attempting to write as laureen.ratinckx@gmail.com from a different account.
3. **Ghost Field**: Creating an album with a `verified: true` field not in schema.
4. **Invalid Type**: Sending a `date` as a boolean.
5. **Path Poisoning**: Using a 1MB string as an album ID.
6. **Orphaned Photo**: Creating a photo with a non-existent `albumId`.
7. **Negative Size**: Sending an empty string for `title`.
8. **Resource Exhaustion**: Sending a 2MB string for `description`.
9. **Private Read**: Attempting to list `messages` as a public user.
10. **State Skipping**: Trying to update `createdAt` of a photo.
11. **Malicious Enum**: Setting category to `hack`.
12. **Unverified Admin**: Logged in with the right email but `email_verified` is false (spoofing check).

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` would verify these scenarios. For this turn, I will proceed to generate the hardened rules directly.
