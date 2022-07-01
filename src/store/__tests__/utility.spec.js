import { getPropertyValue, filterNodesByProperty } from '../utility';

describe('Utilities', () => {
  describe('getPropertyValue', () => {
    const testParentNode = {
      source: null,
      children: [
        {children: []},
        {children: []},
        {children: [
          {source: 'test-source-1', 
            children: [
              {
                source: 'test-source-2',
                children: [{ domain: 'test-domain-1' }]
              }
            ]
          }
        ]}
      ]
    };
    test('returns first target property value if exists', () => {
      const result1 = getPropertyValue(testParentNode, 'source');
      expect(result1).toEqual('test-source-1');

      const result2 = getPropertyValue(testParentNode, 'domain');
      expect(result2).toEqual('test-domain-1');
    })

    test('returns null if no target property is found', () => {
      const result = getPropertyValue(
        { children: [{ key1: 'test-child' }] }, 
        'source',
      )
      expect(result).toBeNull();
    })

    test('returns null if no target property or children are found', () => {
      const result = getPropertyValue({})
      expect(result).toBeNull();
    })

    test('returns null if no nodeObject found', () => {
      const result = getPropertyValue(undefined, 'source')
      expect(result).toBeNull();
    })
  })

  describe('filterNodesByProperty', () => {
    const testLayers = [
      {
        domain: 'test-domain-1',
        children: [
          {
            children: [
              { source: 'test-source-1' }
            ]
          }
        ],
      },
      {
        domain: 'test-domain-2',
        children: [
          { source: 'test-source-2'}
        ],
      },
      {
        children: [{children: []}, {children: [{domain: 'test-domain-1'}]}],
        source: 'test-source-2',
      }
    ]
    test('returns all layers if every search param is inactive', () => {
      const result1 = filterNodesByProperty(
        testLayers, 
        {source: '', domain: ''},
      );
      expect(result1).toHaveLength(3);
    })

    test('matches on single active filter', () => {
      const result1 = filterNodesByProperty(
        testLayers, 
        {source: undefined, domain: 'test-domain-1'}
      );
      expect(result1).toHaveLength(2);

      const result2 = filterNodesByProperty(
        testLayers, 
        {domain: '', source: 'test-source-1'},
      );
      expect(result2).toHaveLength(1);
    })

    test('matches on all active filters', () => {
      const result = filterNodesByProperty(
        testLayers, 
        {source:'test-source-2', domain: 'test-domain-1'},
      );
      expect(result).toHaveLength(1);
    })

    test('returns undefined if no layers found', () => {
      const result = filterNodesByProperty(
        undefined, 
        {source:'test-source-2', domain: 'test-domain-1'},
      );
      expect(result).toBeUndefined();
    })

    test('returns all data if no params found', () => {
      const result = filterNodesByProperty(
        testLayers, 
        undefined,
      );
      expect(result).toHaveLength(3);
    })
  })
})