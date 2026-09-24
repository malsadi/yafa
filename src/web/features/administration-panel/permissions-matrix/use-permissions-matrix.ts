import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ApiError } from '../../../app/api/api-error';
import { useApiRequest } from '../../../app/api/use-api-request';
import {
  fetchMatrix,
  fetchVersions,
  restoreVersion,
  saveCell,
  type CellEdit,
} from './permissions-matrix.api';

const MATRIX_KEY = ['permissions-matrix'] as const;
const VERSIONS_KEY = ['permissions-matrix', 'versions'] as const;

/**
 * The matrix, its history, and the two changes (T-079). Each change is
 * saved at once against the version it was made on; if someone else
 * changed the matrix first, `changedElsewhere` is set and the latest loads.
 */
export function usePermissionsMatrix() {
  const request = useApiRequest();
  const queryClient = useQueryClient();
  const [changedElsewhere, setChangedElsewhere] = useState(false);
  const matrix = useQuery({ queryKey: MATRIX_KEY, queryFn: () => fetchMatrix(request) });
  const versions = useQuery({ queryKey: VERSIONS_KEY, queryFn: () => fetchVersions(request) });

  const refresh = () => queryClient.invalidateQueries({ queryKey: MATRIX_KEY });
  const onError = (error: Error) => {
    setChangedElsewhere(error instanceof ApiError && error.code === 'permissions-matrix.changed');
    return refresh();
  };
  const onSuccess = () => {
    setChangedElsewhere(false);
    return refresh();
  };

  const cell = useMutation({
    mutationFn: (edit: CellEdit) => saveCell(request, edit),
    onSuccess,
    onError,
  });
  const restore = useMutation({
    mutationFn: (params: { fromVersion: number; expectedVersion: number }) =>
      restoreVersion(request, params.fromVersion, params.expectedVersion),
    onSuccess,
    onError,
  });

  return { matrix, versions, cell, restore, changedElsewhere };
}
