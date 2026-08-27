---
name: offline-first
description: Offline-first architecture design, local data persistence with IndexedDB, service worker caching strategies, background synchronization, conflict resolution, network state detection, optimistic updates, offline queue management, and Progressive Web App capabilities. Applicable when designing applications that work without network connectivity, implementing local data storage, setting up service workers, or building resilient offline experiences.
---

# Offline-First

## Purpose

This skill guides the agent in designing and implementing offline-first applications following official web platform standards and best practices. Offline-first is a design philosophy where applications are built to work primarily with local data, treating network connectivity as an enhancement rather than a requirement. The skill covers local data persistence, service worker caching, background synchronization, conflict resolution, and user experience patterns for intermittent connectivity.

---

## When to Load

- User is designing applications that need to work without network connectivity.
- User mentions: `offline-first`, `offline`, `service worker`, `IndexedDB`, `background sync`, `cache`, `PWA`, `progressive web app`, `local storage`, `sync`, `conflict resolution`.
- User is implementing local data persistence, caching strategies, or synchronization logic.
- User is building Progressive Web Apps (PWAs) with offline capabilities.
- User asks about handling network interruptions, optimistic updates, or background data sync.

---

## When NOT to Load

- Applications that always require network connectivity and have no offline requirements.
- Pure backend or server-side logic without client-side components.
- Infrastructure or deployment configuration unrelated to offline capabilities.
- General React component development without offline considerations.

---

## Core Principles

1. **Local Data is the Source of Truth** – The local database is the primary source of truth, not the server. Write to local storage first, then sync to the server when connectivity is available.
2. **Design for Offline First, Add Online Later** – Write your app as if it has no internet connection. Once it works offline, add network functionality as an enhancement.
3. **Eventual Consistency** – Data synchronizes with the server when network connectivity is restored. Users can continue working offline with the guarantee that their data will eventually be consistent.
4. **Separate UI from Data** – Keep the user interface and data layers separate. This improves design, eases offline enablement, and allows multiple views of the same data.
5. **Assume the App Can Be Closed at Any Time** – Save application state locally (and remotely when possible) so users can pick up where they left off.
6. **Sensitive Data Stays on the Server** – Never store passwords, credit card numbers, or other sensitive data locally. Local storage cannot be securely encrypted.

---

## Decision Rules

### Local Storage Technology Selection

- **IF** storing small amounts of simple key-value data (user preferences, settings), **THEN** use Web Storage API (localStorage/sessionStorage).
- **IF** storing significant amounts of structured data, including files/blobs, with the need for high-performance search, **THEN** use IndexedDB.
- **IF** storing data that needs to be queried with complex patterns or relations, **THEN** use IndexedDB with appropriate indexes.
- **IF** building a React application with complex offline needs, **THEN** consider using libraries like `react-offline-kit` or `@imirfanul/react-offline-sync` that handle mutation queuing and synchronization.

### Service Worker Caching Strategies

- **IF** caching static assets (HTML, CSS, JS, fonts, images) for offline use, **THEN** use a cache-first strategy. Serve cached assets first, then fetch from network on subsequent requests.
- **IF** fetching API data that should be fresh but can be served from cache when offline, **THEN** use a stale-while-revalidate strategy. Serve cached data immediately, then update from network in the background.
- **IF** fetching data that must always be fresh (real-time data, user-specific data), **THEN** use a network-first strategy. Attempt network request first, fall back to cache if offline.
- **IF** caching non-critical assets that can be gradually cached, **THEN** use a cache-first strategy with background updates.
- **IF** implementing a service worker, **THEN** use Workbox to simplify caching strategy implementation.

### Data Synchronization

- **IF** performing read operations, **THEN** read from local storage first. Use the local data source as the primary source of truth.
- **IF** performing write operations (create, update, delete), **THEN** write to local storage immediately, then queue the operation for synchronization when online.
- **IF** the application is offline and a mutation occurs, **THEN** queue the mutation with metadata (timestamp, operation type, data) and retry with exponential backoff when connectivity is restored.
- **IF** synchronizing data with the server, **THEN** implement a sync engine that handles:
  - Conflict detection and resolution
  - Idempotent operations (operations that can be safely retried)
  - Ordering of operations (preserve the sequence of user actions)
- **IF** conflicts occur during synchronization, **THEN** use a conflict resolution strategy:
  - **Last Write Wins (LWW)**: The most recent write (by timestamp) takes precedence.
  - **Column-level CRDTs**: Resolve conflicts at the field level so unrelated edits don't overwrite each other.
  - **Custom resolution**: Prompt the user to resolve conflicts or apply application-specific business rules.

### Network State Detection

- **ALWAYS** detect network connectivity changes by listening to `online` and `offline` events.
- **IF** the network status changes from offline to online, **THEN** trigger synchronization of the mutation queue.
- **IF** the network status changes from online to offline, **THEN** notify the user and switch to offline mode.
- **ALWAYS** provide visual feedback to the user about the current connectivity state and sync status.

### Optimistic Updates

- **IF** a user performs a write operation (create, update, delete), **THEN** update the UI optimistically before the server confirms the operation.
- **IF** the server operation fails, **THEN** roll back the optimistic update and notify the user of the failure.
- **IF** the server operation succeeds, **THEN** keep the optimistic update and mark it as confirmed.
- **ALWAYS** store the previous state for rollback in case of failure.

---

## Best Practices

1. **Use IndexedDB for structured data** – IndexedDB is a low-level API for client-side storage of significant amounts of structured data, including files/blobs, with indexes for high-performance searches.
2. **Implement a repository pattern** – Use repositories that combine local and remote data sources to present data in a single access point, independently of connectivity state.
3. **Use Workbox for service worker management** – Workbox provides the most common caching strategies, making it easy to apply them in your service worker.
4. **Implement background sync for mutations** – Use the Background Sync API or a custom queue to replay mutations when connectivity is restored.
5. **Provide visible sync status** – Show users when data is being synced, when conflicts occur, and when the app is offline.
6. **Auto-save everything** – Save application state continuously to prevent data loss if the app is closed unexpectedly.
7. **Test thoroughly** – Test your app in both common and tricky scenarios:
   - App starts offline and then comes online
   - App starts online and then goes offline
   - App is closed and reopened in both states
   - Multiple devices modify the same data
8. **Use HTTPS for service workers** – Service workers are restricted to run over HTTPS for security reasons. For local development, browsers consider `localhost` a secure origin.
9. **Be aware of storage limits** – Browser storage quotas and eviction criteria vary between browsers. Monitor storage usage and handle quota exceeded errors gracefully.
10. **Handle same-origin policy** – IndexedDB follows the same-origin policy. You can access stored data within a domain but not across different domains.

---

## Anti-Patterns

| Anti-Pattern                          | Why it is wrong                                                             | Correct approach                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Storing sensitive data locally        | Local data cannot be securely encrypted; exposes passwords, tokens, or PII. | Keep sensitive data on the server; never store passwords or credit card numbers locally. |
| Writing to the server first           | Users cannot work offline; operations fail without connectivity.            | Write to local storage first, then sync to the server.                                   |
| Not queuing offline mutations         | User changes are lost when offline; poor user experience.                   | Queue mutations and replay them when online.                                             |
| Using localStorage for large datasets | Performance issues and storage limits; not suitable for structured data.    | Use IndexedDB for large, structured datasets.                                            |
| Not handling conflicts                | Data inconsistency across devices; users see conflicting data.              | Implement conflict resolution strategies (LWW, CRDTs, or custom).                        |
| No visual sync feedback               | Users don't know if their data is saved or synced.                          | Provide visible sync status and offline indicators.                                      |
| Not testing offline scenarios         | App breaks in real-world conditions.                                        | Test thoroughly in both online and offline states.                                       |
| Not handling storage quota exceeded   | App crashes or fails to save data.                                          | Handle quota exceeded errors gracefully and notify the user.                             |

---

## Common Mistakes & Edge Cases

| Mistake                                  | Symptom                                             | Solution                                                                                    |
| ---------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Service worker not registering           | Offline features don't work; assets not cached.     | Ensure the service worker file is served from the root or correct scope, and HTTPS is used. |
| Cache invalidation issues                | Users see stale content after updates.              | Implement versioning in the service worker and update caches on new versions.               |
| Mutation queue not persisting            | Queued mutations are lost when the app is closed.   | Persist the mutation queue in IndexedDB or similar persistent storage.                      |
| Conflict resolution not idempotent       | Replaying the same operation causes duplicate data. | Make operations idempotent (use operation IDs or timestamps).                               |
| Not handling partial sync                | Data is partially synced; inconsistent state.       | Use transactions or atomic operations for sync.                                             |
| Race conditions in sync                  | Out-of-order operations cause data corruption.      | Use operation timestamps or sequence numbers to preserve order.                             |
| Not handling network detection correctly | App doesn't respond to connectivity changes.        | Listen to `online` and `offline` events and trigger sync accordingly.                       |
| IndexedDB transaction errors             | Operations fail due to transaction mismanagement.   | Ensure transactions are properly managed and closed.                                        |

---

## Related Skills

- `react` – for implementing offline-first UI components and state management.
- `data-fetching` – for integrating React Query with offline-first patterns and server-state synchronization.
- `api-design` – for designing APIs that support offline-first patterns (idempotent operations, sync endpoints).
- `state-management` – for managing local and server state in offline-first applications.
- `security` – for ensuring sensitive data is not stored locally.
- `performance` – for optimizing offline-first applications with caching and efficient storage.
- `testing` – for testing offline scenarios and synchronization logic.

---

## Official References

- [Service Worker API – Using Service Workers (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [IndexedDB API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Indexed Database API 3.0 (W3C)](https://www.w3.org/TR/IndexedDB/)
- [Workbox – Caching Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [Offline First – Chrome Developers](https://developer.chrome.com/docs/extensions/mv3/offline_apps/)
- [Online and Offline Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [PWA Guides (MDN)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides)
- [Background Sync API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [Storage Quotas and Eviction Criteria (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
