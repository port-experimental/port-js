/**
 * Test fixtures for entities
 * Reusable test data for entity tests
 */

export const validEntityInput = {
  identifier: 'test-service',
  blueprint: 'service',
  title: 'Test Service',
  properties: {
    stringProps: {
      environment: 'production',
      language: 'typescript',
      repository: 'https://github.com/test/repo',
    },
    numberProps: {
      port: 3000,
      replicas: 3,
    },
    booleanProps: {
      isPublic: true,
      hasMonitoring: true,
    },
  },
  relations: {
    singleRelations: {
      team: 'backend-team',
      owner: 'john@example.com',
    },
    manyRelations: {
      dependencies: ['database', 'cache', 'queue'],
      vulnerabilities: [],
    },
  },
};

export const invalidEntityInput = {
  identifier: '', // Invalid: empty identifier
  blueprint: 'service',
  title: 'Invalid Service',
};

export const mockEntityResponse = {
  ...validEntityInput,
  id: 'ent_123456',
  createdAt: '2025-10-03T00:00:00Z',
  updatedAt: '2025-10-03T00:00:00Z',
  createdBy: 'system',
  updatedBy: 'system',
};

export const mockEntitiesList = [
  mockEntityResponse,
  {
    ...validEntityInput,
    identifier: 'test-service-2',
    title: 'Test Service 2',
    id: 'ent_123457',
    createdAt: '2025-10-03T00:00:00Z',
    updatedAt: '2025-10-03T00:00:00Z',
  },
];

export const mockPaginatedResponse = {
  ok: true,
  entities: mockEntitiesList,
  total: 2,
  limit: 50,
  offset: 0,
  hasMore: false,
};

