import { StorageKeys } from './storage-keys';

describe('StorageKeys', () => {
  it('builds a payable attachment key under the condominium folder', () => {
    const key = StorageKeys.payableAttachment({
      condominiumId: '11111111-1111-1111-1111-111111111111',
      payableId: '22222222-2222-2222-2222-222222222222',
      type: 'INVOICE',
      originalName: 'nota fiscal.PDF',
    });

    expect(key).toMatch(
      /^condominiums\/11111111-1111-1111-1111-111111111111\/payables\/22222222-2222-2222-2222-222222222222\/invoice\/[0-9a-f-]+\.pdf$/,
    );
  });

  it('rejects path traversal in keys', () => {
    expect(() => StorageKeys.assertSafeKey('../etc/passwd')).toThrow();
    expect(() =>
      StorageKeys.payableAttachment({
        condominiumId: '../x',
        payableId: '22222222-2222-2222-2222-222222222222',
        type: 'RECEIPT',
        originalName: 'a.pdf',
      }),
    ).toThrow();
  });
});
