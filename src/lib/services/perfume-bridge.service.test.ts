import { describe, it, expect } from 'vitest';
import { extractFragellaIdFromSearchItem } from './perfume-bridge.service';

describe('extractFragellaIdFromSearchItem', () => {
  it('returns direct id when item.id exists', () => {
    expect(extractFragellaIdFromSearchItem({ id: 'chanel-bleu' })).toBe('chanel-bleu');
    expect(extractFragellaIdFromSearchItem({ id: '123', name: 'X' })).toBe('123');
  });

  it('rejects direct ids starting with idx-', () => {
    expect(extractFragellaIdFromSearchItem({ id: 'idx-0' })).toBeNull();
    expect(extractFragellaIdFromSearchItem({ _id: 'idx-5' })).toBeNull();
  });

  it('extracts canonical id from /fragrances/<slug> URL', () => {
    expect(
      extractFragellaIdFromSearchItem({
        'Purchase URL': 'https://example.com/fragrances/dior-sauvage',
      })
    ).toBe('dior-sauvage');
    expect(
      extractFragellaIdFromSearchItem({
        purchase_url: 'https://fragella.com/ar/fragrances/chanel-bleu',
      })
    ).toBe('chanel-bleu');
  });

  it('rejects generic URL last-segment fallback (non-/fragrances/ URL must return null)', () => {
    expect(
      extractFragellaIdFromSearchItem({
        url: 'https://example.com/some/chanel-bleu',
      })
    ).toBeNull();
    expect(
      extractFragellaIdFromSearchItem({
        link: 'https://store.com/products/perfume-name',
      })
    ).toBeNull();
  });

  it('returns null for malformed encoded URL instead of throwing', () => {
    expect(
      extractFragellaIdFromSearchItem({
        'Purchase URL': '%',
      })
    ).toBeNull();
    expect(
      extractFragellaIdFromSearchItem({
        url: 'https://x.com/fragrances/%2',
      })
    ).toBeNull();
  });

  it('rejects blocklisted URL-derived segments like /fragrances/perfume', () => {
    expect(
      extractFragellaIdFromSearchItem({
        'Purchase URL': 'https://x.com/fragrances/perfume',
      })
    ).toBeNull();
    expect(
      extractFragellaIdFromSearchItem({
        url: 'https://x.com/fragrances/en_us',
      })
    ).toBeNull();
    expect(
      extractFragellaIdFromSearchItem({
        url: 'https://x.com/fragrances/eau-de-parfum',
      })
    ).toBeNull();
  });
});
