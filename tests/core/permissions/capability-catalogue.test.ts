import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCapabilityDefinition,
  listCapabilityDefinitions,
  registerCapability,
  resetCapabilityCatalogueForTests,
} from '../../../src/worker/core/permissions';
import { PermissionScope } from '../../../src/shared/core/permission-scope';

describe('capability catalogue', () => {
  beforeEach(() => {
    resetCapabilityCatalogueForTests();
  });

  it('rejects a capability name that is not <service>.<resource>.<action>', () => {
    expect(() => {
      registerCapability({
        capability: 'delete-everything',
        label: 'x',
        description: 'x',
        allowedScopes: [PermissionScope.OwnUnit],
      });
    }).toThrow();
  });

  it('rejects registering the same capability twice', () => {
    const definition = {
      capability: 'treasury.entries.create',
      label: 'Create entry',
      description: 'x',
      allowedScopes: [PermissionScope.OwnUnit],
    };
    registerCapability(definition);
    expect(() => {
      registerCapability(definition);
    }).toThrow();
  });

  it('returns a registered definition by name, and undefined for an unknown one', () => {
    registerCapability({
      capability: 'treasury.entries.read',
      label: 'Read entries',
      description: 'x',
      allowedScopes: [PermissionScope.OwnUnit, PermissionScope.AllUnits],
    });

    expect(getCapabilityDefinition('treasury.entries.read')?.label).toBe('Read entries');
    expect(getCapabilityDefinition('treasury.entries.delete')).toBeUndefined();
  });

  it('lists every registered definition', () => {
    registerCapability({
      capability: 'treasury.entries.read',
      label: 'x',
      description: 'x',
      allowedScopes: [PermissionScope.OwnUnit],
    });
    registerCapability({
      capability: 'treasury.entries.create',
      label: 'x',
      description: 'x',
      allowedScopes: [PermissionScope.OwnUnit],
    });

    expect(
      listCapabilityDefinitions()
        .map((definition) => definition.capability)
        .sort(),
    ).toEqual(['treasury.entries.create', 'treasury.entries.read']);
  });
});
